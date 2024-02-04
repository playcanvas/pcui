# PCUI Docs Guide

The PCUI documentation website is built using a Jekyll template. The markdown pages for the site can be found and edited in the `docs/pages` directory.

The docs site also makes use of Storybook to display React components. If you are developing the PCUI library, you should use `npm run storybook` directly to generate the storybook. The following guide is for updating and publishing the documentation site.

### Developing Docs Locally

Ensure you have Ruby 3.x installed. Go [here](https://rubyinstaller.org/downloads/) for a Windows installer.

To install the Ruby dependencies, run:

    cd docs
    bundle install
    cd ..

If you are having trouble with the install, try deleting the `Gemfile.lock` file.

You are now able to build the site:

    npm run build:docsite:local

To view the built site, run:

    npm run docsite:serve

Open your browser and visit: http://localhost:3497/

### Publishing Docs

The PCUI docs site is automatically redeployed one every commit to the `main` branch.
