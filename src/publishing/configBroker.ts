import { SettingNames } from "./../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { AadClientConfig } from "../contracts/aadClientConfig";
import { AadB2CClientConfig } from "../contracts/aadB2cClientConfig";
import { IdentityService } from "../services";

export class ConfigBroker {
    constructor(
        private readonly identityService: IdentityService,
        private readonly settingsProvider: ISettingsProvider
    ) {
        this.loadConfiguration();
    }

    public async loadConfiguration(): Promise<void> {
        const designTimeSettings = {};
        const managementApiUrl = await this.settingsProvider.getSetting(SettingNames.managementApiUrl);

        designTimeSettings[SettingNames.managementApiUrl] = managementApiUrl;

        const identityProviders = await this.identityService.getIdentityProviders();

        const aadIdentityProvider = identityProviders.find(x => x.type === SettingNames.aadClientConfig);

        if (aadIdentityProvider) {
            const aadConfig: AadClientConfig = {
                clientId: aadIdentityProvider.clientId,
                authority: aadIdentityProvider.authority,
                signinTenant: aadIdentityProvider.signinTenant
            };

            designTimeSettings[SettingNames.aadClientConfig] = aadConfig;
        }

        const aadB2CIdentityProvider = identityProviders.find(x => x.type === SettingNames.aadB2CClientConfig);

        if (aadB2CIdentityProvider) {
            let signinTenant = aadB2CIdentityProvider.signinTenant;

            if (!signinTenant && aadB2CIdentityProvider.allowedTenants.length > 0) {
                signinTenant = aadB2CIdentityProvider.allowedTenants[0];
            }

            const aadB2CConfig: AadB2CClientConfig = {
                clientId: aadB2CIdentityProvider.clientId,
                authority: aadB2CIdentityProvider.authority,
                signinTenant: signinTenant,
                signinPolicyName: aadB2CIdentityProvider.signinPolicyName,
                signupPolicyName: aadB2CIdentityProvider.signupPolicyName,
                passwordResetPolicyName: aadB2CIdentityProvider.passwordResetPolicyName,
            };

            designTimeSettings[SettingNames.aadB2CClientConfig] = aadB2CConfig;
        }

        sessionStorage.setItem("designTimeSettings", JSON.stringify(designTimeSettings));
    }
}