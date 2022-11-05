
# PCUI docs guide

### Updating component pages (Optional if you’ve added a new component)

Open `./docs/create-component-pages.js`

Add your new component to the components array (including the category and component name).

`cd ./docs`

`node create-component-pages.js`

Commit any changes to the pcui repo.

### Testing docs locally

If you haven't cloned the [playcanvas.github.io](https://github.com/playcanvas/playcanvas.github.io) repo, install it locally to a projects folder which will now be referenced as `<projects_folder>`.

In the `pcui/docs` directory run:
`bundle install`

To install the ruby dependencies. If you are having trouble with the install, try deleting the `Gemfile.lock` file.

Then in the pcui directory run:

`npm run docs:local`

`rm -rf ~/<projects_folder>/playcanvas.github.io/pcui/`

`cp -r ./docs/_site/ ~/<projects_folder>/playcanvas.github.io/pcui/`

`cd ~/<projects_folder>/playcanvas.github.io`

`python -m SimpleHTTPServer 4000`

Visit http://localhost:4000/pcui

### Publishing docs

In the pcui main directory run:

`npm run docs:build`

`rm -rf ~/<projects_folder>/playcanvas.github.io/pcui/`

`cp -r ./docs/_site/ ~/<projects_folder>/playcanvas.github.io/pcui/`

`cd ~/<projects_folder>/playcanvas.github.io`

Commit changes to the [playcanvas.github.io](https://github.com/playcanvas/playcanvas.github.io) repo & create a PR

Upon the PR merging into the master branch of the repo, http://playcanvas.github.io/pcui will be updated.