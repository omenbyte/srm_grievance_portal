export interface TelegramMessage {
  issueType: string
  subCategory: string
  message: string
  imageUrl?: string | null
  userDetails: {
    firstName: string
    lastName: string
    registrationNo: string
    mobile: string
  }
  grievanceId: string
  ticketNumber: string
} 