import { Text, View } from "react-native"
import { CircleDashed, CircleCheck } from "lucide-react-native"

import { colors } from "@/styles/colors"

export type ParticipantProps = {
  id: string
  name?: string
  email: string
  is_confirmed: boolean
}

type Props = {
  data: ParticipantProps
}

export function Participant({ data }: Props) {
  return (
    <View className="w-full flex-row items-center">
      <View className="flex-1">
        <Text className="text-zinc-100 text-base font-semibold">
          {data.name ?? "Pendente"}
        </Text>

        <Text className="text-zinc-400 text-sm">{data.email}</Text>
      </View>

      {data.is_confirmed ? (
        <CircleCheck color={colors.lime[300]} size={20} />
      ) : (
        <CircleDashed color={colors.zinc[400]} size={20} />
      )}
    </View>
  )
}
