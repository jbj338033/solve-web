export { adminProblemApi } from './api/problem-api'
export type { CreateProblemRequest, UpdateProblemRequest, ExampleRequest } from './api/problem-api'

export { adminContestApi } from './api/contest-api'
export type { CreateContestRequest, UpdateContestRequest, ContestProblemRequest } from './api/contest-api'

export { adminWorkbookApi } from './api/workbook-api'
export type { CreateWorkbookRequest, UpdateWorkbookRequest } from './api/workbook-api'

export { adminTagApi } from './api/tag-api'
export type { CreateTagRequest, UpdateTagRequest } from './api/tag-api'

export { adminBannerApi } from './api/banner-api'
export type { CreateBannerRequest, UpdateBannerRequest } from './api/banner-api'

export type {
  AdminAuthor,
  AdminProblem,
  AdminProblemDetail,
  AdminProblemExample,
  AdminProblemTag,
  AdminContest,
  AdminContestDetail,
  AdminContestProblem,
  AdminWorkbook,
  AdminWorkbookDetail,
  AdminWorkbookProblem,
  AdminTag,
  AdminBanner,
} from './model/types'

export { ProblemForm, type ProblemFormData } from './ui'
