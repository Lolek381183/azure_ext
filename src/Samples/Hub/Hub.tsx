import "./Hub.scss";

import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import { CommonServiceIds, IHostPageLayoutService } from "azure-devops-extension-api";

import { Header, TitleSize } from "azure-devops-ui/Header";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { Page } from "azure-devops-ui/Page";
import { Tab, TabBar, TabSize } from "azure-devops-ui/Tabs";

import { OverviewTab } from "./OverviewTab"; 
import { showRootComponent } from "../../Common";

import { GitServiceIds, IVersionControlRepositoryService } from "azure-devops-extension-api/Git/GitServices";
import { GitRepository } from "azure-devops-extension-api/Git/Git";


interface IHubContentState {
    selectedTabId: string;
    fullScreenMode: boolean;
    headerDescription?: string;
    useLargeTitle?: boolean;
    useCompactPivots?: boolean;
    repository: GitRepository | null;
}

class HubContent extends React.Component<{}, IHubContentState> {

    constructor(props: {}) {
        super(props);

        this.state = {
            selectedTabId: "overview",
            fullScreenMode: false,
            repository: null
        };
    }

    public async componentDidMount() {
        SDK.init();
        this.initializeFullScreenState();
        const at = await SDK.getAccessToken()
        const repoSvc = await SDK.getService<IVersionControlRepositoryService>(GitServiceIds.VersionControlRepositoryService);
        const repository = await repoSvc.getCurrentGitRepository();
        console.log(at)

        this.setState({
            repository
        });
    }

    public render(): JSX.Element {

        const { selectedTabId, headerDescription, useCompactPivots, useLargeTitle } = this.state;

        return (
            <Page className="sample-hub flex-grow">
                <OverviewTab />
            </Page>
        );
    }

    private async initializeFullScreenState() {
        const layoutService = await SDK.getService<IHostPageLayoutService>(CommonServiceIds.HostPageLayoutService);
        const fullScreenMode = await layoutService.getFullScreenMode();
        if (fullScreenMode !== this.state.fullScreenMode) {
            this.setState({ fullScreenMode });
        }
    }
}

showRootComponent(<HubContent />);