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

import { SalesHistoryResult } from "./../salesAnalytics";
import { generateHr } from "./hr";
import { amountToDisplay } from "../utils/currency";
import { moveDown } from "./common";
import { RegionDTO } from "@medusajs/framework/types";

export default class PdfSalesTemplate {
  private static generateTableRow(
    doc,
    date,
    currencyCode,
    sales
  ) {
    const startY = doc.y;
    doc
      .fontSize(10)
      .text(date, 70, startY, { align: "left" })
      .text(currencyCode, 200, startY, { align: "left" })
      .text(sales, 320, startY, { width: 90, align: "right" })
  }

  static generateTableTitle(doc, region: RegionDTO) {
    doc
      .fontSize(14)
    moveDown(doc)

    doc
      .text(`${region.name}`, 70, doc.y, { align: "left"})
    
    doc
      .fontSize(12)
    moveDown(doc)
  }
  
  static generateTable(doc, salesHistoryResult: SalesHistoryResult) : void {
  
    doc.font("Helvetica-Bold");
    this.generateTableRow(
      doc,
      "Date",
      "Currency code",
      "Sales",
    );
    moveDown(doc)
    generateHr(doc);
    moveDown(doc)
    doc.font("Helvetica");
  
    let totalCurrent = 0;
    for (const currentSalesResult of salesHistoryResult.current) {
      totalCurrent += Number(currentSalesResult.total);
      this.generateTableRow(
        doc,
        currentSalesResult.date.toLocaleDateString(),
        salesHistoryResult.currencyCode.toUpperCase(),
        amountToDisplay(Number(currentSalesResult.total), salesHistoryResult.currencyCode)
      );
  
      moveDown(doc)
      generateHr(doc);
      moveDown(doc)
    }
  
    this.generateTableRow(
      doc,
      "Total",
      "",
      amountToDisplay(totalCurrent, salesHistoryResult.currencyCode)
    );
    moveDown(doc)
  }
  
  static generateHeader(doc) : void {
    doc
      .fontSize(18)
    moveDown(doc)
    

    doc
      .text('Sales by region', 70, doc.y, { align: "left"})
    
    doc
      .fontSize(12)
    moveDown(doc)
  }
}