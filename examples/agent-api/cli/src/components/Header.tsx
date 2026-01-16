import React from "react";
import { Box, Text } from "ink";

export const Header = React.memo(function Header(): React.ReactElement {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="magenta"
      paddingX={2}
      paddingY={1}
      marginBottom={1}
      width="100%"
    >
      <Box justifyContent="center">
        <Text bold color="magenta">
          🏦 BANKR CLI
        </Text>
      </Box>
      <Box justifyContent="center">
        <Text dimColor>Chat with Bankr</Text>
      </Box>
    </Box>
  );
});
