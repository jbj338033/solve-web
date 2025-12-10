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
    contest = await contestApi.getContest(contestId)
    problem = await problemApi.getProblem(problemId)
  } catch {
    notFound()
  }

  // Check if contest is ongoing
  const status = getContestStatus(contest.startAt, contest.endAt)
  if (status !== 'ONGOING') {
    notFound()
  }

  // Check if problem is part of contest
  const contestProblem = contest.problems.find((p) => p.id === problemId)
  if (!contestProblem) {
    notFound()
  }

  return <SolveWorkspace problem={problem} contestId={contestId} />
}
