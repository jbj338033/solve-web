import { notFound } from 'next/navigation'
import { problemApi } from '@/entities/problem'
import { contestApi, getContestStatus } from '@/entities/contest'
import { SolveWorkspace } from '@/widgets/solve-workspace'

interface Props {
  params: Promise<{ contestId: string; problemId: string }>
}

export default async function ContestProblemSolvePage({ params }: Props) {
  const { contestId, problemId } = await params

  let contest
  let problem

  try {
    contest = await contestApi.getContest(Number(contestId))
    problem = await problemApi.getProblem(Number(problemId))
  } catch {
    notFound()
  }

  const status = getContestStatus(contest.startAt, contest.endAt)
  if (status !== 'ONGOING') {
    notFound()
  }

  const contestProblem = contest.problems.find((p) => p.id === Number(problemId))
  if (!contestProblem) {
    notFound()
  }

  return <SolveWorkspace problem={problem} contestId={Number(contestId)} />
}
