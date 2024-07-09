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

export function generateHr(doc) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(70, doc.y)
    .lineTo(550, doc.y)
    .stroke();
}
