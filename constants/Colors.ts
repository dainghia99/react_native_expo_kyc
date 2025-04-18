const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";

const Colors = (colorScheme?: string) => ({
    PRIMARY: "#FF6B00",
    SECONDARY: "#FFA559",
    SUCCESS: "#4CAF50",
    SUCCESS_LIGHT: "#E8F5E9",
    DANGER: "#F44336",
    WARNING: "#FFC107",
    INFO: "#2196F3",
    LIGHT: "#F5F5F5",
    DARK: "#212121",
    WHITE: "#FFFFFF",
    BLACK: "#000000",
    GRAY: "#757575",
    LIGHT_GRAY: "#BDBDBD",
    BORDER: "#E0E0E0",
    BACKGROUND: "#F9F9F9",
    TEXT: "#212121",
    TEXT_SECONDARY: "#757575",
    TRANSPARENT: "transparent",

    // Light and dark specific colors
    light: {
        text: "#000",
        background: "#fff",
        tint: tintColorLight,
        tabIconDefault: "#ccc",
        tabIconSelected: tintColorLight,
    },
    dark: {
        text: "#fff",
        background: "#000",
        tint: tintColorDark,
        tabIconDefault: "#ccc",
        tabIconSelected: tintColorDark,
    },
});

export default Colors;
