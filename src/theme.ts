import { createSystem, defaultConfig, defineConfig, defineSemanticTokens, defineTextStyles, defineTokens } from "@chakra-ui/react"

const tokens = defineTokens({
    colors: {
        primary: {
            50: { value: "#FFF3E0" },
            100: { value: "#FFE7C6" },
            200: { value: "#FFD7A0" },
            300: { value: "#FFC373" },
            400: { value: "#FFAD3A" },
            500: { value: "#FFA103" },
            600: { value: "#D5860D" },
            700: { value: "#AA6C10" },
            800: { value: "#784D11" },
            900: { value: "#3E290C" },
            950: { value: "#1D1200" },
        },
        secondary: {
            50: { value: "#FAE2DD" },
            100: { value: "#F5CAC1" },
            200: { value: "#ECA79A" },
            300: { value: "#DD7E6F" },
            400: { value: "#C94D41" },
            500: { value: "#AB2B26" },
            600: { value: "#9A2823" },
            700: { value: "#7B231E" },
            800: { value: "#551B17" },
            900: { value: "#29110D" },
            950: { value: "#150505" },
        },
        tertiary: {
            50: { value: "#FBE4DE" },
            100: { value: "#FBCFC2" },
            200: { value: "#F8B29D" },
            300: { value: "#F19175" },
            400: { value: "#DE5533" },
            500: { value: "#CC4F30" },
            600: { value: "#B8482C" },
            700: { value: "#923B25" },
            800: { value: "#652B1C" },
            900: { value: "#301610" },
            950: { value: "#160704" },
        },
    },
});

const semanticTokens = defineSemanticTokens({
    colors: {
        bg: {
            DEFAULT: { value: "#F4E7C8" },
            subtle: { value: "#FFF4D6" },
            muted: { value: "#E9DEBF" },
            emphasized: { value: "#E0D5B7" },
            inverted: { value: "#151004" },
        },
        fg: {
            DEFAULT: { value: "#280B05" },
            subtle: { value: "#9D594A" },
            muted: { value: "#AFA19E" },
            inverted: { value: "#FCEDEA" },
        },
        primary: {
            DEFAULT: { value: "#FFA103" },
            contrast: { value: "#1D1200" },
            fg: { value: "#AA6C10" },
            subtle: { value: "#FFE7C6" },
            muted: { value: "#FFD7A0" },
            emphasized: { value: "#FFC373" },
            solid: { value: "#FFA103" },
        },
        secondary: {
            DEFAULT: { value: "#AB2B26" },
            contrast: { value: "#FAE2DD" },
            fg: { value: "#7B231E" },
            subtle: { value: "#F5CAC1" },
            muted: { value: "#ECA79A" },
            emphasized: { value: "#DD7E6F" },
            solid: { value: "#AB2B26" },
        },
        border: {
            DEFAULT: { value: "#DFD5BD" },
            subtle: { value: "#ECE1C6" },
            muted: { value: "#EAE0C9" },
            emphasized: { value: "#D0C4A8" },
            inverted: { value: "#160704" },
        }
    },
});

const textStyles = defineTextStyles({
    body: {
        value: {
            fontFamily: "Sora, sans-serif",
        }
    }
})

const config = defineConfig({
    theme: {
        tokens,
        semanticTokens,
        textStyles
    },
    globalCss: {
        body: {
            bg: "bg",
            color: "fg",
        },
    }
});

export default createSystem(defaultConfig, config)