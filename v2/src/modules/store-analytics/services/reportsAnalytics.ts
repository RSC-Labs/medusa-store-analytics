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

import { OrderStatus } from "@medusajs/framework/utils";
import { RegionDTO } from "@medusajs/framework/types";
import { PgConnectionType } from "../utils/types"

import PDFDocument from 'pdfkit';
import PdfSalesTemplate from "./pdf-templates/sales-template"
import PdfOrdersTemplate from "./pdf-templates/orders-template";
import PdfCustomersTemplate from "./pdf-templates/customers-template";
import { generateReportHeader } from "./pdf-templates/common";
import PdfProductsTemplate from "./pdf-templates/products-template";
import { OrdersHistoryResult } from "./ordersAnalytics";
import { SalesHistoryResult } from "./salesAnalytics";
import { CustomersHistoryResult } from "./customersAnalytics";
import { VariantsCountPopularityResult } from "./productsAnalytics";

type InjectedDependencies = {
  __pg_connection__: PgConnectionType,
}

type ReportInput = {
  ordersHistory: OrdersHistoryResult, 
  salesHistories: SalesHistoryResult[], 
  customersHistory: CustomersHistoryResult, 
  variantsCountPopularityResult: VariantsCountPopularityResult,
  regions: RegionDTO[]
}

export class ReportsAnalyticsService {

  protected pgConnection: PgConnectionType;

  constructor({ __pg_connection__ }: InjectedDependencies) {
    this.pgConnection = __pg_connection__
  }
  async generateReport(orderStatuses: OrderStatus[], input: ReportInput, from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) {
    var doc = new PDFDocument();

    const buffers = []
    doc.on("data", buffers.push.bind(buffers))

    generateReportHeader(doc, orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo);

    // Orders
    PdfOrdersTemplate.generateHeader(doc);
    PdfOrdersTemplate.generateTable(doc, input.ordersHistory);

    // Sales
    PdfSalesTemplate.generateHeader(doc);
    for (const region of input.regions) {
      const salesHistory = input.salesHistories.find(salesHistory => salesHistory.currencyCode == region.currency_code);
      if (salesHistory) {
        PdfSalesTemplate.generateTableTitle(doc, region);
        PdfSalesTemplate.generateTable(doc, salesHistory);
      }
    }

    // Customers
    doc.addPage();
    PdfCustomersTemplate.generateHeader(doc);
    PdfCustomersTemplate.generateTable(doc, input.customersHistory);

    // Products
    doc.addPage();
    PdfProductsTemplate.generateHeader(doc);
    PdfProductsTemplate.generateTable(doc, input.variantsCountPopularityResult);

    doc.end();

    const bufferPromise = new Promise<Buffer>(resolve => {
      doc.on("end", () => {
          const pdfData = Buffer.concat(buffers)
          resolve(pdfData)
      })
    })

    return await bufferPromise;
  }
}