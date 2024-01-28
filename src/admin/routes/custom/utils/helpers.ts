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

export function calculatePercentage(current: number, previous: number) : number | undefined {
  if (current == previous) {
    return 0;
  }
  if (current == 0) {
    return 100;
  }

  if (previous == 0) {
    return undefined;
  }

  const percentage: number = Number((((current) - previous) / previous).toFixed(2)) * 100;
  if (percentage > 0) {
    return Math.round(percentage * 100) / 100;
  }
  return Math.round((percentage - percentage - percentage) * 100) / 100;
}