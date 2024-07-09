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

import { OrderStatus } from "@medusajs/medusa"


const Y_REACHED_TO_ADD_NEW_PAGE = '650';

function addPageIfReachingEnd(doc) {
  if (doc.y > Y_REACHED_TO_ADD_NEW_PAGE) {
    doc.addPage();
  }
}

export function moveDown(doc) {
  addPageIfReachingEnd(doc);
  doc.moveDown();
}

export function generateReportHeader(doc, orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : void {
  doc
    .fillColor("#444444")
    .fontSize(20)

  doc
    .text('Store analytics report', { align: "center"})

  doc
    .fontSize(16)
    .moveDown()
  
  doc
    .text('for', { align: "center"})
    .moveDown();

  if (from) {
    doc
      .text(`${from.toDateString()} - ${to ? to.toDateString() : new Date(Date.now()).toDateString()}`, { align: "center"})
      .moveDown();
  } else {
    doc
      .text(`All time - ${to ? to.toDateString() : new Date(Date.now()).toDateString()}`, { align: "center"})
      .moveDown();
  }
  doc
    .fontSize(10)
    .text(`Filtered by order statuses:`, { align: "center"})

  orderStatuses.map(orderStatus => doc
    .text(orderStatus, { align: "center"})
  );

  doc
    .addPage()
}