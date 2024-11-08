from w3nest.app.environment import Environment
from w3nest.app.routers.projects import IPipelineFactory, JsBundle, Link
from w3nest.pipelines.pipeline_typescript_weback_npm import pipeline, PipelineConfig
from w3nest_client.context import Context


class PipelineFactory(IPipelineFactory):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    async def get(self, env: Environment, context: Context):
        config = PipelineConfig(
            target=JsBundle(
                links=[
                    Link(name="doc", url="dist/docs/index.html"),
                    Link(name="coverage", url="coverage/lcov-report/index.html"),
                    Link(name="bundle-analysis", url="dist/bundle-analysis.html"),
                ]
            )
        )
        return await pipeline(config, context)
