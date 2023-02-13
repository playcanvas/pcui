
# PCUI docs guide

The PCUI documentation website is built using a Jekyll template. The markdown pages for the site can be found and edited in the `docs/pages` directory.

The doc site also makes use of storybook to display React components and typedocs to display the API reference. If you are developing the PCUI library, you should use `npm run storybook` and `npm run typedocs` directly to generate the storybook and typedocs respectively. The following guide is for updating and publishing the documentation site.

### Testing docs locally

Ensure you have Ruby 3.x installed. Go [here](https://rubyinstaller.org/downloads/) for a Windows installer.

In the `pcui/docs` directory run:

`bundle install`

To install the ruby dependencies. If you are having trouble with the install, try deleting the `Gemfile.lock` file.

Then in the main PCUI directory run:

`npm run build:typedocs` to build the latest typedocs API reference site which will be copied into the doc site in the next step

`npm run build:docsite:local` to build the Jekyll doc site and latest storybook

`npm run docsite:serve` to serve the Jekyll doc site

Visit http://localhost:3497/

### Publishing docs

If you haven't cloned the [playcanvas.github.io](https://github.com/playcanvas/playcanvas.github.io) repo, install it locally to a projects folder which will now be referenced as `<projects_folder>`.

Then in the PCUI main directory run:

`npm run build:docsite:production`

`rm -rf ~/<projects_folder>/playcanvas.github.io/pcui/`

`cp -r ./docs/_site/ ~/<projects_folder>/playcanvas.github.io/pcui/`

`cd ~/<projects_folder>/playcanvas.github.io`

Commit changes to the [playcanvas.github.io](https://github.com/playcanvas/playcanvas.github.io) repo & create a PR

Upon the PR merging into the master branch of the repo, http://playcanvas.github.io/pcui will be updated.
