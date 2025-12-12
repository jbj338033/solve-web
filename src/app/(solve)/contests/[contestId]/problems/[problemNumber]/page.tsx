import { notFound } from 'next/navigation'
import { problemApi } from '@/entities/problem'
import { contestApi, getContestStatus } from '@/entities/contest'
import { SolveWorkspace } from '@/widgets/solve-workspace'

interface Props {
  params: Promise<{ contestId: string; problemNumber: string }>
}

export default async function ContestProblemSolvePage({ params }: Props) {
  const { contestId, problemNumber } = await params

  let contest
  let problem

  try {
    contest = await contestApi.getContest(contestId)
    problem = await problemApi.getProblem(Number(problemNumber))
  } catch {
    notFound()
  }

  const status = getContestStatus(contest.startAt, contest.endAt)
  if (status !== 'ONGOING') {
    notFound()
  }

  const contestProblem = contest.problems.find((p) => p.number === Number(problemNumber))
  if (!contestProblem) {
    notFound()
  }

  return <SolveWorkspace problem={problem} contestId={contestId} />
}
