
interface SwapErrorMessageProps {
  title: string
  description: string
}

export const SwapErrorMessage = ({title, description}: SwapErrorMessageProps) => {
  return(
    <div className="my-4 bg-red-400 p-4 rounded">
    <p>{title}</p>
    <p>{description}</p>
  </div>
  )
}