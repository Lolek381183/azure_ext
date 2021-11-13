import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import {
  CommonServiceIds,
  IProjectPageService,
  IHostNavigationService,
  INavigationElement,
  IPageRoute,
} from "azure-devops-extension-api";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import * as buffer from "buffer";
(window as any).Buffer = buffer.Buffer;
import { GitRepository } from "azure-devops-extension-api/Git/Git";
import { GitServiceIds, IVersionControlRepositoryService } from "azure-devops-extension-api/Git/GitServices";

export interface IOverviewTabState {
  userName?: string;
  projectName?: string;
  iframeUrl?: string;
  data?: string;
  extensionData?: string;
  extensionContext?: SDK.IExtensionContext;
  host?: SDK.IHostContext;
  navElements?: INavigationElement[];
  route?: IPageRoute;
  repository: GitRepository | null;
}

export class OverviewTab extends React.Component<{}, IOverviewTabState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      iframeUrl: window.location.href,
      data: "",
      repository: null
    };
  }

  public async componentDidMount() {
    this.initializeState();
    SDK.init();
    const at = await SDK.getAccessToken()
    const repoSvc = await SDK.getService<IVersionControlRepositoryService>(GitServiceIds.VersionControlRepositoryService);
    repoSvc.getCurrentGitRepository().then(
        async (response) => {
            if (response != null){
                const id = response.id
                const org = response.url.split("/")[1]
                const project = response.url.split("/")[2]
                fetch(
                    "https://dev.azure.com/"+org+"/"+project+"/_apis/git/repositories/"+id+"/items?path=/swagger.json&download=false&api-version=6.0",
                    {
                      method: "GET",
                      headers: {
                        Authorization:
                          "Bearer " + at,
                      },
                    }
                  )
                    .then(async (response) => {
                      const data = await response.json();
                      console.log("esto respondio:");
                      console.log(data);
                      const str = JSON.stringify(data);
                      const bytes = new TextEncoder().encode(str);
                      const blob = new Blob([bytes], {
                          type: "application/json;charset=utf-8"
                      });
                      console.log(blob);
                      const url = URL.createObjectURL(blob)
                      this.setState({
                          data: url
                      })
                    })
                    .catch((error) => {
                      console.error("There was an error!", error);
                    });
            }
        }
    );

    

    
  }

  private async initializeState(): Promise<void> {
    await SDK.ready();

    const userName = SDK.getUser().displayName;
    this.setState({
      userName,
      extensionContext: SDK.getExtensionContext(),
      host: SDK.getHost(),
    });

    const projectService = await SDK.getService<IProjectPageService>(
      CommonServiceIds.ProjectPageService
    );
    const project = await projectService.getProject();
    if (project) {
      this.setState({ projectName: project.name });
    }

    const navService = await SDK.getService<IHostNavigationService>(
      CommonServiceIds.HostNavigationService
    );
    const navElements = await navService.getPageNavigationElements();
    this.setState({ navElements });

    const route = await navService.getPageRoute();
    this.setState({ route });
  }

  public render(): JSX.Element {
    const {
      data
    } = this.state;

    return (
      <div className="page-content page-content-top flex-column rhythm-vertical-16">
        <SwaggerUI url={data}></SwaggerUI>
      </div>
    );
  }
}
