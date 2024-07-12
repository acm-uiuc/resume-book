"use client";

import { ReactNode } from "react";
import {
  Group,
  Button,
  UnstyledButton,
  Text,
  ThemeIcon,
  Divider,
  Center,
  Box,
  Burger,
  Drawer,
  Collapse,
  ScrollArea,
  rem,
  useMantineTheme,
  Skeleton,
  HoverCard,
  SimpleGrid,
  Anchor,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./index.module.css";
import LogoBadge from "./Logo";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const HeaderNavbar: React.FC = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  return (
    <Box>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Group justify="start" h="100%" gap={10}>
            <LogoBadge />

            <a href="/" className={classes.link}>
              Home
            </a>
          </Group>
          <Group h="100%" justify="end" gap={0} visibleFrom="sm">
            {isLoggedIn ? (
              <Button variant="outline" fullWidth onClick={() => {logout();}}>
                Log Out
              </Button>
            ) : (
              <Button variant="filled" fullWidth onClick={() => {navigate("/login")} }>
                Sign In
              </Button>
            )}
          </Group>
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
          />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="ACM@UIUC Resume Book"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

          <a href="#" className={classes.link}>
            Home
          </a>
          {isLoggedIn ? (
            <Button variant="outline" style={{ marginTop: "1em" }} fullWidth>
              Log Out
            </Button>
          ) : (
            <Button variant="filled" style={{ marginTop: "1em" }} fullWidth>
              Sign In
            </Button>
          )}
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

export { HeaderNavbar };
