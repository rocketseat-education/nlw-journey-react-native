import { colors } from "@/styles/colors"
import { Link2 } from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"
import * as Linking from "expo-linking"

export type TripLinkProps = {
  id: string
  title: string
  url: string
}

type Props = {
  data: TripLinkProps
}

export function TripLink({ data }: Props) {
  function handleLinkOpen() {
    Linking.openURL(data.url)
  }

  return (
    <View className="w-full flex-row items-center gap-4">
      <View className="flex-1">
        <Text className="text-zinc-100 text-base font-semibold">
          {data.title}
        </Text>
        <Text className="text-zinc-400 text-sm" numberOfLines={1}>
          {data.url}
        </Text>
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={handleLinkOpen}>
        <Link2 color={colors.zinc[400]} size={20} />
      </TouchableOpacity>
    </View>
  )
}
