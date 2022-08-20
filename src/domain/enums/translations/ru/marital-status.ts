import { MaritalStatus } from '@/domain/enums/marital-status'

export const MaritalStatusTranslations: Record<MaritalStatus, string> = {
  Free: 'Свободен(на)',
  Friendship: 'Есть напримете',
  Complicated: 'Все сложно',
  Busy: 'Занят(а)',
}
