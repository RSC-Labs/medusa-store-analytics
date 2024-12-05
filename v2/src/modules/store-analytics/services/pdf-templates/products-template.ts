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

import { VariantsCountPopularityResult } from "./../productsAnalytics";
import { moveDown } from "./common";
import { generateHr } from "./hr";

export default class PdfProductsTemplate {
  private static generateTableRow(
    doc,
    product,
    variant,
    sum,
  ) {
    const startY = doc.y;
    doc
      .fontSize(10)
      .text(product, 70, startY, { align: "left" })
      .text(variant, 200, startY, { align: "left" })
      .text(sum, 320, startY, { width: 90, align: "right" })
    }

  static generateTable(doc, variantsCountPopularityResult: VariantsCountPopularityResult) : void {
  
    doc.font("Helvetica-Bold");
    this.generateTableRow(
      doc,
      "Product",
      "Variant",
      "Sum",
    );
    moveDown(doc)
    generateHr(doc);
    moveDown(doc)
    doc.font("Helvetica");
  
    let totalCurrent = 0;
    for (const currentResults of variantsCountPopularityResult.current) {
      totalCurrent += Number(currentResults.sum);
      this.generateTableRow(
        doc,
        currentResults.productTitle,
        currentResults.variantTitle,
        currentResults.sum
      );
  
      moveDown(doc)
      generateHr(doc);
      moveDown(doc)
    }
  
    this.generateTableRow(
      doc,
      "Total",
      "",
      totalCurrent
    );
    moveDown(doc)
  }
  
  static generateHeader(doc) : void {
    doc
      .fontSize(18)
    moveDown(doc)
  
    doc
      .text('Top products', 70, doc.y, { align: "left"})
    
    doc
      .fontSize(12)
    moveDown(doc)
  }
}