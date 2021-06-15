import * as Msal from "msal";
import { RouteGuard, Route } from "@paperbits/common/routing";
import { IAuthenticator } from "../authentication";
import * as Constants from "../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { AadB2CClientConfig } from "../contracts/aadB2CClientConfig";


export class AadSignOutRouteGuard implements RouteGuard {
    constructor(
         private readonly authenticator: IAuthenticator,
         private readonly settingsProvider: ISettingsProvider
    ) { }

    public async canActivate(route: Route): Promise<boolean> {
        if (route.hash !== Constants.hashSignOut) {
            return true;
        }
        
        const config = await this.settingsProvider.getSetting<AadB2CClientConfig>(Constants.SettingNames.aadClientConfig);

        const msalConfig = {
            auth: {
                clientId: config.clientId
            }
        };

        const msalInstance = new Msal.UserAgentApplication(msalConfig);
        msalInstance.logout();

         this.authenticator.clearAccessToken();
        // location.assign("/");
    }
}