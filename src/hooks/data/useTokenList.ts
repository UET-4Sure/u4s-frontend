import { Token } from "@/components/widgets/type";
import { useQuery } from "@tanstack/react-query";
import { TOKEN_LIST } from "@/app/(dashboard)/(trade)/swap/config";

export function useTokenList() {
    return useQuery({
        queryKey: ["tokenList"],
        queryFn: async () => {
            return TOKEN_LIST;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60, // 1 minute
    })
}