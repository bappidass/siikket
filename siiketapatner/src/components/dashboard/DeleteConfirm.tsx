import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type Props = {
  trigger?: React.ReactNode
  itemId: string
  itemName?: string
  onConfirm: (id: string) => void
  onCancel?: () => void
}

export function DeleteConfirmationDialog({
  trigger,
  itemId,
  itemName = "item",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white text-black">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemName}?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            This action cannot be undone. Are you sure you want to delete this {itemName}?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-gray-100 text-black hover:bg-gray-200"
            onClick={onCancel}
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => onConfirm(itemId)}
          >
            Confirm Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}