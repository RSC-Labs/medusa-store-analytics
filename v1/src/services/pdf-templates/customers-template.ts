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

import { CustomersHistoryResult } from "../customersAnalytics";
import { moveDown } from "./common";
import { generateHr } from "./hr";

export default class PdfCustomersTemplate {
  private static generateTableRow(
    doc,
    date,
    customers
  ) {
    const startY = doc.y;
    doc
      .fontSize(10)
      .text(date, 70, startY, { align: "left" })
      .text(customers, 320, startY, { width: 90, align: "right" })
  }

  static generateTable(doc, customersHistoryResult: CustomersHistoryResult) : void {
  
    doc.font("Helvetica-Bold");
    this.generateTableRow(
      doc,
      "Date",
      "New customers count",
    );
    moveDown(doc)
    generateHr(doc);
    moveDown(doc)
    doc.font("Helvetica");
  
    let totalCurrent = 0;
    for (const currentCustomersHistoryResult of customersHistoryResult.current) {
      totalCurrent += Number(currentCustomersHistoryResult.customerCount);
      this.generateTableRow(
        doc,
        new Date(currentCustomersHistoryResult.date).toLocaleDateString(),
        currentCustomersHistoryResult.customerCount
      );
  
      moveDown(doc)
      generateHr(doc);
      moveDown(doc)
    }
  
    this.generateTableRow(
      doc,
      "Total",
      totalCurrent
    );
    moveDown(doc)
  }
  
  static generateHeader(doc) : void {
    doc
      .fontSize(18)
    moveDown(doc)
  
    doc
      .text('New customers', 70, doc.y, { align: "left"})
    
    doc
      .fontSize(12)
    moveDown(doc)
  }
}