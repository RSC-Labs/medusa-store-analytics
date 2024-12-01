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

import { generateHr } from "./hr";
import { OrdersHistoryResult } from "../utils/types";
import { moveDown } from "./common";

export default class PdfOrdersTemplate {
  private static generateTableRow(
    doc,
    date,
    orders
  ) {
    const startY = doc.y;
    doc
      .fontSize(10)
      .text(date, 70, startY, { align: "left" })
      .text(orders, 320, startY, { width: 90, align: "right" })
  }

  static generateTable(doc, ordersHistoryResult: OrdersHistoryResult) : void {
  
    doc.font("Helvetica-Bold");
    this.generateTableRow(
      doc,
      "Date",
      "Orders count",
    );
    moveDown(doc)
    generateHr(doc);
    moveDown(doc)
    doc.font("Helvetica");
  
    let totalCurrent = 0;
    for (const currentOrdersHistoryResult of ordersHistoryResult.current) {
      totalCurrent += Number(currentOrdersHistoryResult.orderCount);
      this.generateTableRow(
        doc,
        new Date(currentOrdersHistoryResult.date).toLocaleDateString(),
        currentOrdersHistoryResult.orderCount
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
      .text('Orders', 70, doc.y, { align: "left"})
    
    doc
      .fontSize(12)
    moveDown(doc)
  }
}