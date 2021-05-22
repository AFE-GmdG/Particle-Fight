import { Store } from "@easm/core";
import { createHook } from "@easm/react";

import { Client } from "./services/portalService";

export type ApplicationStoreState = {
  portal: {
    myself: Client | null;
    knownClients: Client[];
  };
};

export const applicationStore = new Store<ApplicationStoreState>({
  portal: {
    myself: null,
    knownClients: [],
  },
});

export const usePortalStore = createHook(applicationStore, (state) => state.portal);
