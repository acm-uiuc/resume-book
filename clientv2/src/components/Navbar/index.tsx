'use client';

import { Group, Divider, Box, Burger, Drawer, ScrollArea, rem, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './index.module.css';
import LogoBadge from './Logo';
import { AuthContextData, AuthRoleEnum, AuthSourceEnum } from '../AuthContext';
import { AuthenticatedProfileDropdown } from '../ProfileDropdown';

interface HeaderNavbarProps {
  userData?: AuthContextData | null;
}

const isActiveLink = (path: string) => location.pathname === path;

const HeaderNavbar: React.FC<HeaderNavbarProps> = ({ userData }) => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  return (
    <Box>
      <header className={classes.header}>
        <Group justify="space-between" align="center" h="100%">
          <Group justify="start" align="center" h="100%" gap={10}>
            <LogoBadge />
            <Group justify="start" align="center" h="100%" gap={10} visibleFrom="sm">
              {userData?.role === AuthRoleEnum.STUDENT ? (
                <a href="/profile" className={classes.link}>
                  My Profile
                </a>
              ) : null}
            </Group>
          </Group>
          <Group h="100%" justify="end" align="center" gap={10} visibleFrom="sm">
            {userData ? <AuthenticatedProfileDropdown userData={userData} /> : null}
          </Group>
          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
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
          <a href="/" className={classes.link}>
            Home
          </a>
          {userData?.role === AuthRoleEnum.STUDENT ? (
            <a href="/profile" className={classes.link}>
              My Profile
            </a>
          ) : null}
          {userData ? <AuthenticatedProfileDropdown userData={userData} /> : null}
        </ScrollArea>
      </Drawer>
    </Box>
  );
};

export { HeaderNavbar };
