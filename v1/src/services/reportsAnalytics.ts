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

import { OrderStatus, RegionService, TransactionBaseService } from "@medusajs/medusa"
import OrdersAnalyticsService from "./ordersAnalytics";
import PDFDocument from 'pdfkit';
import SalesAnalyticsService, { SalesHistoryResult } from "./salesAnalytics";
import PdfSalesTemplate from "./pdf-templates/sales-template"
import PdfOrdersTemplate from "./pdf-templates/orders-template";
import { OrdersHistoryResult } from "./utils/types";
import CustomersAnalyticsService, { CustomersHistoryResult } from "./customersAnalytics";
import PdfCustomersTemplate from "./pdf-templates/customers-template";
import ProductsAnalyticsService, { VariantsCountPopularityResult } from "./productsAnalytics";
import { generateReportHeader } from "./pdf-templates/common";
import PdfProductsTemplate from "./pdf-templates/products-template";

export default class ReportsAnalyticsService extends TransactionBaseService {

  private readonly ordersAnalyticsService: OrdersAnalyticsService;
  private readonly customersAnalyticsService: CustomersAnalyticsService;
  private readonly salesAnalyticsService: SalesAnalyticsService;
  private readonly productsAnalyticsService: ProductsAnalyticsService;
  private readonly regionService: RegionService;

  constructor(
    container,
  ) {
    super(container)
    this.ordersAnalyticsService = container.ordersAnalyticsService;
    this.salesAnalyticsService = container.salesAnalyticsService;
    this.customersAnalyticsService = container.customersAnalyticsService;
    this.productsAnalyticsService = container.productsAnalyticsService;
    this.regionService = container.regionService;
  }

  async generateReport(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<Buffer> | undefined {

    var doc = new PDFDocument();

    const buffers = []
    doc.on("data", buffers.push.bind(buffers))

    generateReportHeader(doc, orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo);

    const regions = await this.regionService.list();
    
    // Orders
    PdfOrdersTemplate.generateHeader(doc);
    const ordersHistoryResult: OrdersHistoryResult =  await this.ordersAnalyticsService.getOrdersHistory(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
    PdfOrdersTemplate.generateTable(doc, ordersHistoryResult);

    // Sales
    doc.addPage();
    PdfSalesTemplate.generateHeader(doc);
    for (const region of regions) {
      PdfSalesTemplate.generateTableTitle(doc, region);
      const salesAnalyticsResult: SalesHistoryResult = await this.salesAnalyticsService.getOrdersSales(orderStatuses, region.currency_code, from, to, dateRangeFromCompareTo, dateRangeToCompareTo)
      PdfSalesTemplate.generateTable(doc, salesAnalyticsResult);
    }

    // Customers
    doc.addPage();
    PdfCustomersTemplate.generateHeader(doc);
    const customersHistoryResult: CustomersHistoryResult = await this.customersAnalyticsService.getHistory(from, to, dateRangeFromCompareTo, dateRangeToCompareTo)
    PdfCustomersTemplate.generateTable(doc, customersHistoryResult);


    // Products
    doc.addPage();
    PdfProductsTemplate.generateHeader(doc);
    const variantsCountPopularityResult: VariantsCountPopularityResult = await this.productsAnalyticsService.getTopVariantsByCount(orderStatuses, from, to, dateRangeFromCompareTo, dateRangeToCompareTo);
    PdfProductsTemplate.generateTable(doc, variantsCountPopularityResult);

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