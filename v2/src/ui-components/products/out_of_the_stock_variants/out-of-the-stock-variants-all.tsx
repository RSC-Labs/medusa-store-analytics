/*
 * Copyright 2024 RSC-Labs, https://rsoftcon.com/
 *
 * MIT License
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Heading, Text, FocusModal, Button, Alert } from "@medusajs/ui"
import { CircularProgress, Grid, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import { Table } from "@medusajs/ui"
import { useMemo } from "react"
import { OutOfTheStockVariantsCountResponse, OutOfTheStockVariantsTableRow, transformToVariantTopTable } from "./helpers";

function TablePaginated({variants} : {variants: OutOfTheStockVariantsTableRow[]}) {
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 5;
  const pageCount = Math.ceil(variants.length / pageSize)
  const canNextPage = useMemo(
    () => currentPage < pageCount - 1,
    [currentPage, pageCount]
  )
  const canPreviousPage = useMemo(() => currentPage - 1 >= 0, [currentPage])

  const nextPage = () => {
    if (canNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const previousPage = () => {
    if (canPreviousPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const currentVariants = useMemo(() => {
    const offset = currentPage * pageSize
    const limit = Math.min(offset + pageSize, variants.length)

    return variants.slice(offset, limit)
  }, [currentPage, pageSize, variants])

  return (
    <div className="flex gap-1 flex-col">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Variant</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {currentVariants.map((variant) => {
            return (
              <Table.Row
                key={variant.variantId}
                className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
              >
                <Table.Cell>
                <Grid container justifyContent={'space-between'}>
                  <Grid item>
                    <Link to={`../products/${variant.productId}`}>
                      <Grid container alignItems={'center'} spacing={2}>
                        {variant.thumbnail && <Grid item>
                          <Box
                            sx={{
                              width: 30,
                              height: 40
                            }}
                            component="img"
                            alt={`Thumbnail for ${variant.productTitle}`}
                            src={variant.thumbnail}
                          />
                        </Grid>}
                        <Grid item>
                          {variant.productTitle} - {variant.variantTitle}
                        </Grid>
                      </Grid>
                    </Link>
                  </Grid>
                </Grid>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      <Table.Pagination
        count={variants.length}
        pageSize={pageSize}
        pageIndex={currentPage}
        pageCount={variants.length}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        previousPage={previousPage}
        nextPage={nextPage}
      />
    </div>
  )
}

const OutOfTheStockVariantsModalContent = () => {

  const [data, setData] = useState<OutOfTheStockVariantsCountResponse | undefined>(undefined)

  const [error, setError] = useState<any>(undefined);

  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const params: URLSearchParams = new URLSearchParams({
      limit: '0'
    })

    fetch(`/admin/products-analytics/out-of-the-stock-variants?${params.toString()}`, {
      credentials: "include",
    })
    .then((res) => res.json())
    .then((result) => {
      setData(result)
      setLoading(false)
    })
    .catch((error) => {
      setError(error);
      console.error(error);
    }) 
  }, [isLoading])

  if (isLoading) {
    return (
      <FocusModal.Body>
        <CircularProgress/>
      </FocusModal.Body>
    )
  }

  if (error) {
    const trueError = error as any;
    const errorText = `Error when loading data. It shouldn't have happened - please raise an issue. For developer: ${trueError?.response?.data?.message}`
    return (
      <FocusModal.Body>
        <Alert variant="error">{errorText}</Alert>
      </FocusModal.Body>
    );
  }

  return (
    <FocusModal.Body>
      <Grid container direction={'column'} alignContent={'center'} paddingTop={8}>
        <Grid item>
          <Heading>All out of the stock variants</Heading>
        </Grid>
        <Grid item>
          <Text>
            You can click on the row to go to the product.
          </Text>
        </Grid>
        <Grid item paddingTop={5}>
          <TablePaginated variants={transformToVariantTopTable(data.analytics)}/>
        </Grid>
      </Grid>
    </FocusModal.Body>
  )
}

export const OutOfTheStockVariantsModal = () => {
  const [open, setOpen] = useState(false)

  return (
    <FocusModal
      open={open}
      onOpenChange={setOpen}
    >
      <FocusModal.Trigger asChild>
        <Button size="small" variant="secondary">See all</Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        <FocusModal.Header/>
        <OutOfTheStockVariantsModalContent/>
      </FocusModal.Content>
    </FocusModal>
  )
}
