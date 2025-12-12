import { notFound } from 'next/navigation'
import { problemApi } from '@/entities/problem'
import { SolveWorkspace } from '@/widgets/solve-workspace'

interface Props {
  params: Promise<{ problemId: string }>
}

export default async function ProblemSolvePage({ params }: Props) {
  const { problemId } = await params

  let problem
  try {
    problem = await problemApi.getProblem(Number(problemId))
  } catch {
    notFound()
  }

  return <SolveWorkspace problem={problem} />
}
