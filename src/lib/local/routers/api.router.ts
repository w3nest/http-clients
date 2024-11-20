import { Router } from '../../primitives'
import { CustomCommandsRouter } from './custom-commands'
import { EnvironmentRouter } from './environment'
import { ComponentsRouter } from './components'
import { ProjectsRouter } from './projects'
import { SystemRouter } from './system'
import { WsRouter } from '..'

export class ApiRouter extends Router {
    public readonly customCommands: CustomCommandsRouter
    public readonly environment: EnvironmentRouter
    public readonly projects: ProjectsRouter
    public readonly system: SystemRouter
    public readonly components: ComponentsRouter

    constructor(parent: Router, ws: WsRouter) {
        super(parent.headers, `${parent.basePath}/api`)
        this.customCommands = new CustomCommandsRouter(this, ws)
        this.environment = new EnvironmentRouter(this, ws)
        this.projects = new ProjectsRouter(this, ws)
        this.system = new SystemRouter(this, ws)
        this.components = new ComponentsRouter(this, ws)
    }
}
