import React from "react";
import { Alert, Text } from "@mantine/core";
import { IconQuestionMark } from "@tabler/icons-react";

export interface ProfileSearchResultsProp {
    data: any[] | null;
  }
  
export const ProfileSearchResults: React.FC<ProfileSearchResultsProp> = ({ data }) => {
    if (data === null) {
        return null;
    }
    if (data.length === 0) {
        return <Alert variant="light" color="yellow" title="No Profiles Found" style={{marginTop: '1em'}} icon={<IconQuestionMark />}>
            Perhaps refine your search and try again?
        </Alert>
    }
    return null;
};