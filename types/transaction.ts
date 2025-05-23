// Define the data type for our anonymous customer transactions
export interface Transaction {
    id: string
    date: Date
    amount: number
    name: string
    paymentMethod: string
    status: "completed" | "pending" | "failed"
}