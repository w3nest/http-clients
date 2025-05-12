from shutil import copyfile
from pathlib import Path

from w3nest.ci.ts_frontend import ProjectConfig, PackageType, Dependencies, \
    RunTimeDeps, generate_template, Bundles, MainModule
from w3nest.utils import parse_json

project_folder = Path(__file__).parent.parent

pkg_json = parse_json(project_folder / 'package.json')


config = ProjectConfig(
    path=project_folder,
    type=PackageType.LIBRARY,
    name=pkg_json['name'],
    version=pkg_json['version'],
    shortDescription=pkg_json['description'],
    inPackageJson={
        "browser": {
            "fs": False,
            "path": False,
            "os": False
        },
        "scripts": {
            # 'src/tests' folder need to be corrected
            "lint-eslint-check": "eslint ./src/lib",
        }
    },
    author=pkg_json['author'],
    dependencies=Dependencies(
        runTime=RunTimeDeps(
            externals={
                "rxjs": "^7.5.6",
            },
        ),
        devTime={
            "adm-zip": "0.5.9"
        }
    ),
    bundles=Bundles(
        mainModule=MainModule(
            entryFile='./index.ts',
            loadDependencies=["rxjs"]
        )
    ),
    testConfig="https://github.com/youwol/integration-tests-conf",
    )

template_folder = Path(__file__).parent / '.template'
generate_template(config=config,dst_folder=template_folder)

files = [
    "README.md",
    "package.json",
    "jest.config.ts",
    "webpack.config.ts",
    ]
for file in files:
    copyfile(src=template_folder / file, dst=project_folder / file)
