# Visual Studio Code Documentation

You've found the GitHub repository that contains the source for the Visual Studio Code documentation at <https://code.visualstudio.com/docs>.

## Contribute to VS Code documentation

Thank you for your interest in VS Code documentation!

* [Prerequisites](#prerequisites)
* [Quick Start](#quick-start)
* [Contributing](#contributing)
* [Testing Your Changes](#testing-your-changes)
* [Documentation intent](#documentation-intent)
* [Repository organization](#repository-organization)
* [Branches](#branches)
* [Authoring Tools](#authoring-tools)
* [How to use Markdown to format your topic](#how-to-use-markdown-to-format-your-topic)
* [Topic Metadata](#topic-metadata)
* [Experimental and preview features](#experimental-and-preview-features)
* [Learn courses](#learn-courses)
* [Formatting](#formatting)

> [!IMPORTANT]
> Before submitting a pull request, especially for rendering or link issues, please review the content on the official VS Code website, [code.visualstudio.com](https://code.visualstudio.com). The element in question may render correctly after processing by the website build.

## Prerequisites

Before you start contributing, make sure you have:

* **Git** installed and configured on your machine
* **Git LFS** enabled - this repository uses Git LFS for managing images. See the [Git LFS setup section](#git-lfs-setup) below.
* **A GitHub account** to fork the repository and submit pull requests

### Git LFS setup

> [!IMPORTANT]
> Make sure you have Git LFS enabled on your machine before cloning the repository!

The vscode-docs repository uses [Git LFS](https://git-lfs.github.com/) to manage large image files efficiently. Without Git LFS, you'll download placeholder files instead of actual images.

1. Install Git LFS from [git-lfs.github.com](https://git-lfs.github.com/)
2. Set up Git LFS in your environment:
   ```bash
   git lfs install
   ```
3. Clone or pull the repository - Git LFS will automatically handle the image files

## Quick Start

For simple edits like fixing typos or updating a few lines:

1. Navigate to the file on GitHub (for example, browse to `https://github.com/microsoft/vscode-docs/blob/main/docs/editing/codebasics.md`)
2. Select the **Edit** button (pencil icon) in the top right
3. Make your changes in GitHub's web editor
4. Scroll down and add a descriptive commit message
5. Select **Commit changes** to create a branch and start a pull request

For more substantial contributions, follow the complete [Contributing](#contributing) workflow below.

## Contributing

To contribute to [VS Code documentation](https://code.visualstudio.com/docs), follow these steps:

### Step 1: Fork and clone the repository

1. [Fork the `vscode-docs` repository](https://github.com/microsoft/vscode-docs) to your GitHub account
2. Clone your fork to your local machine:

   ```bash
   git clone https://github.com/YOUR-USERNAME/vscode-docs.git
   cd vscode-docs
   ```

3. Add the upstream repository as a remote:

   ```bash
   git remote add upstream https://github.com/microsoft/vscode-docs.git
   ```

### Step 2: Create a branch

Create a new branch for your changes. Use a descriptive name that reflects your contribution:

```bash
git checkout -b fix/update-debugging-docs
```

> [!TIP]
> Keep each branch focused on a single topic or fix. This makes reviews easier and reduces merge conflicts.

### Step 3: Make your changes

1. Make your edits to the Markdown files and images
2. Follow the [Formatting](#formatting) guidelines below
3. Review the [Documentation intent](#documentation-intent) to ensure your changes align with our goals
4. Test your changes locally if possible (see [Testing Your Changes](#testing-your-changes))

### Step 4: Commit your changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "Fix typo in debugging documentation"
```

> [!TIP]
> Use GitHub Copilot to help generate commit messages! Select the sparkle icon in the Source Control view.

Learn more:

* [Changing a commit message](https://docs.github.com/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/changing-a-commit-message)
* [How to squash commits](https://docs.github.com/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/about-pull-request-merges#squash-and-merge-your-commits)

### Step 5: Push and create a pull request

1. Push your branch to your fork:

   ```bash
   git push origin fix/update-debugging-docs
   ```

2. Go to the [vscode-docs repository](https://github.com/microsoft/vscode-docs) on GitHub
3. Select **Compare & pull request**
4. Fill out the pull request template with:
   * A clear title summarizing your changes
   * A description of what you changed and why
   * References to any related issues
5. Submit the pull request

Learn more about [making pull requests](https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).

## Testing Your Changes

### Preview locally with Docsify

You can preview the documentation site locally using [Docsify](https://docsify.js.org/). This provides a browsable site with sidebar navigation, search, and cross-linking — useful for reviewing content changes before submitting a pull request.

```bash
npm install
npm run serve
```

This starts a local server (default `http://localhost:3000`) with:

* Sidebar navigation generated from `docs/toc.json` and `api/toc.json`
* Top navbar to switch between Docs, Extension API, Blogs, and Release Notes
* Full-text search across all content

> [!NOTE]
> The local preview is **not an exact copy of the production site** at code.visualstudio.com. Custom syntax like `kb(command.id)` keybinding macros, interactive `prompt` code blocks, and some layout details will not render as they do on the production site. Use the local preview to verify content, navigation, and cross-links.

### Validate your Markdown

* Check that your Markdown is properly formatted
* Verify that all links are correct (relative paths for internal links, full URLs for external)
* Ensure images are in the correct location with proper alt text
* Test any code samples to make sure they work

### Use VS Code to help

> [!TIP]
> Use GitHub Copilot in VS Code to help you:
>
> * Write clear documentation following our style guide
> * Generate proper Markdown formatting
> * Identify potential issues in your content
> * Review your changes before submitting

## Documentation intent

The goal of the VS Code documentation is to educate users on VS Code features and how VS Code can be used to enhance their development experience with different programming languages and runtimes.

The documentation is not intended to provide:

* An introduction to coding or software development
* Tutorials on technologies independent from VS Code
* Promotion of third-party tools, plug-ins, or services
* Excessive detail or advanced walkthroughs

The documentation should target developers learning to use VS Code or searching for quick answers to commonly asked questions.  Other forums such as blog posts can provide more detailed content elaborating on specific scenarios.

## Repository organization

This repository contains the following top-level folders:

* \api - content for the API documentation at <https://code.visualstudio.com/api>
* \blogs - content for the blog at <https://code.visualstudio.com/blogs>
* \build - content for the documentation build process, such as the keybinding mappings and sitemap
* \docs - content for the documentation at <https://code.visualstudio.com/docs> - the content in this folder follows the organization of the documentation table of contents
* \images - images used in the documentation
* \learn - content for the training courses at <https://code.visualstudio.com/learn>
* \release-notes - content for the release notes at <https://code.visualstudio.com/updates>
* \remote - content for the remote development tools documentation at <https://code.visualstudio.com/docs/remote>
* \remote-release-notes - content for the remote development tools release notes
* \wiki - content for the repository wiki

Within these folders, you'll find the Markdown files used for the content. Each of these folders also contains an `\images` folder that references the images (such as screenshots) used in the topics.

### Branches

We recommend that you create local working branches that target a specific scope of change. Each branch should be limited to a single concept or topic to streamline workflow and reduce merge conflicts.

**Appropriate scope for a new branch:**

* A new topic and associated images
* Spelling and grammar edits on a topic
* Applying a single formatting change across a large set of topics

**Branch naming suggestions:**

* `docs/add-debugging-tutorial`
* `fix/typo-in-extensions-doc`
* `update/refresh-setup-screenshots`

## Authoring tools

[Visual Studio Code](https://code.visualstudio.com) is a great editor for Markdown!

In fact, VS Code and its core documentation are written using VS Code.

## How to use Markdown to format your topic

The topics in this repository use Markdown.  Here is a good overview of [Markdown basics](https://docs.github.com/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax).

## Topic Metadata

Topic metadata enables certain functionalities for the topics such as topic description and online search optimization.

The page title is taken from the first H1 heading in the topic.

* **ContentId** - A GUID that uniquely identifies the topic to DevDiv doc reporting.
* **DateApproved** - The date of the most recent update or review. It is displayed at the bottom of an article to indicate freshness. The date should be updated in a significant PR.
* **MetaDescription** - The meta description for this page, which helps for search. Use sentence structure limited to 300 characters.
* **MetaSocialImage** - Optional. Used for og:image in page header for sharing on social media. Should be 1024 x 512 .png.
* **MetaTags** - Optional. Further tags for this page again for search.
* **Keywords** - Optional. A list of keywords relevant to this topic to help with search.
* **FeatureStatus** - Optional. The feature ID from `/build/feature-lifecycle.json` when the whole page documents an experimental or preview feature.

## Experimental and preview features

The `/build/feature-lifecycle.json` registry is the source of truth for non-stable feature states in the documentation. Each entry has a lowercase kebab-case ID, display label, and `experimental` or `preview` state. Do not add stable features to the registry.

The website can build without the registry so infrastructure and content changes can be deployed independently. When the file is absent, the build treats it as an empty registry and renders no lifecycle status UI. An existing registry must still be valid.

To mark a whole page, add its feature ID to the topic metadata:

```yaml
FeatureStatus: agent-artifacts
```

Keep the H1 free of manually authored `(Preview)` or `(Experimental)` text. The website build adds a consistent status treatment after the H1.

To mark a feature within a page, add an empty marker directly after the heading or content that introduces it:

```html
<div class="docs-feature-status" data-feature="integrated-browser-remote"></div>
```

Keep enablement steps, limitations, and other feature-specific guidance in the authored content. The generated treatment only describes the lifecycle state.

When a feature becomes stable:

1. Remove its entry from `/build/feature-lifecycle.json`.
2. Remove all matching `FeatureStatus` metadata and inline markers.
3. Update prose that describes preview or experimental limitations.

The registry is the authoritative switch. If a valid page or inline reference is accidentally left behind after its entry is removed, the website build omits the status treatment and renders the surrounding content normally. The build reports unresolved references as non-blocking audit output so stale source can be cleaned up.

## Table of contents

The table of contents (TOC) is defined in the `/docs/toc.yml` file. The TOC is used to generate the left rail navigation for the documentation. If a topic is not listed in the `/docs/toc.yml` file, it will not be included in the left rail navigation.

To add a new topic to the TOC, add a new entry in the `topics` attribute of the appropriate section in the `/docs/toc.yml` file. The TOC is organized into sections, each with a name and an area. The area is used to group related topics together.

The order in which the topics are listed in the `/docs/toc.yml` file determines the order in which they are displayed in the left rail navigation.

Each topic in the TOC has two attributes:

* TOC title: the title that is displayed in the left rail navigation.
* File name: the relative path to the topic file in the format `/docs/<subfolder>/<filename-without-md>`.

The following example shows a `Getting Started` section that has two topics.

```yaml
    {
      "name": "Getting Started",
      "area": "getstarted",
      "topics": [
        ["VS Code Tutorial", "/docs/editing/getting-started"],
        ["Copilot Quickstart", "/docs/getstarted/copilot-quickstart"]
      ]
    },
```

To create a subsection within a section, add a subsection entry to the `topics` attribute. A subsection entry has the following attributes:

* TOC Title: empty string
* File name: empty string
* Subsection: a subsection entry with the same format as a section entry. It has a `name` attribute, an `area` attribute, and a `topics` attribute.

The following example shows a `Guides` subsection with two topics, within the `GitHub Copilot` section.

```yaml
    {
      "name": "GitHub Copilot",
      "area": "copilot",
      "topics": [
        ["Overview", "/docs/agent-native/overview"],
        ["Setup", "/docs/setup/copilot"],
        ["", "", {
          "name": "Guides",
          "area": "copilot/guides",
          "topics": [
            ["Test with Copilot", "/docs/agents/guides/test-with-copilot"],
            ["Debug with Copilot", "/docs/agents/guides/debug-with-copilot"]
          ]
        }
        ],
        ["FAQ", "/docs/agents/agent-troubleshooting/faq"]
      ]
    },
```

## Learn courses

The [Learn](https://code.visualstudio.com/learn) area hosts structured training courses. A **course** is a group of related articles that appears as a card on the Learn home page and as an expandable section in the Learn navigation.

Learn content lives in the `/learn` folder, separate from `/docs`, and has its own table of contents at `/learn/toc.json`:

```
/learn
├── toc.json                 # Defines the courses, their home page cards, and navigation
├── images/
│   └── shared/              # Images shared across courses (for example, social images)
└── <course-area>/           # One folder per course
    ├── <article>.md         # One Markdown file per topic
    └── images/              # Images for this course's articles
```

To add a new course, follow these steps.

### Step 1: Create the course folder and articles

1. Create a folder for the course under `/learn`, using a lowercase, dash-separated name for the `area` (for example, `/learn/testing`).
2. Add a Markdown file for each topic. Learn articles follow the same [Formatting](#formatting) and [Topic Metadata](#topic-metadata) conventions as the rest of the documentation, and the page title comes from the first H1 heading.

   ```markdown
   ---
   ContentId: <GUID>
   DateApproved: 03/30/2026
   MetaDescription: A one-sentence description of the article, used for search.
   MetaSocialImage: ../images/shared/testing-social.png
   ---
   # Introduction to testing with agents

   Article content...
   ```

### Step 2: Add images

Store article images in an `images` subfolder inside the course folder (for example, `/learn/testing/images/`) and reference them with relative paths:

```markdown
![Test Explorer showing passing tests](../images/testing/test-explorer.png)
```

During the build, these images are published under `/assets/learn/<course-area>/` with the `images/` segment removed. For example, `/learn/testing/images/test-explorer.png` is served at `/assets/learn/testing/test-explorer.png`.

> [!IMPORTANT]
> Make sure you have Git LFS enabled before committing images! See the [Git LFS setup](#git-lfs-setup) section.

### Step 3: Register the course in `toc.json`

Add an entry to `/learn/toc.json` to make the course appear on the Learn home page and in the navigation. Each course entry has the following attributes:

* `name` - the course title shown on the home page card and in the navigation.
* `area` - the course folder name. This must match the folder you created in Step 1.
* `description` - a short summary shown on the home page card.
* `topics` - an ordered list of `[title, link]` pairs, one per article. The `link` is the site-relative path to the article without the `.md` extension. The order sets the navigation order, and the first topic is used as the card's link.

```json
{
  "name": "Testing with agents",
  "area": "testing",
  "description": "Learn how to write, run, and debug tests with AI agents in VS Code.",
  "topics": [
    ["Introduction to testing with agents", "/learn/testing/introduction"],
    ["Generate tests with agent mode", "/learn/testing/generate-tests"]
  ]
}
```

### Step 4 (optional): Add a home page card image

To show an image on the course's home page card, add the image to the course's `images` folder (see Step 2) and reference its published path from the course entry in `toc.json`:

* `image` - a single card image used for all color themes.
* `imageLight` and `imageDark` - theme-specific images. When only these are set, the dark image is used as the default.

```json
{
  "name": "Testing with agents",
  "area": "testing",
  "description": "Learn how to write, run, and debug tests with AI agents in VS Code.",
  "image": "/assets/learn/testing/testing-card.png",
  "topics": [ ... ]
}
```

Card images are decorative and don't need alt text.

## Product name

Use the full product name "Visual Studio Code" in the topic MetaDescription and the first use in a topic. You can use the shortened "VS Code" after that throughout the rest of the content. Do not use "VSCode" (no space) or "Code".

### Metadata for /api docs

**For Writer**:

* **MetaDescription** - The meta description for this page, which helps for search.

**For Doc Maintainer**:

* **DateApproved** - This is set when the page is published on the VS Code website.

## File and Folder names

Use lowercase for file and folder names and dashes `-` as separators.

For example:

* `/docs/editor/workspace-trust.md`
* `/docs/supporting/troubleshoot-terminal-launch.md`
* `/api/extension-guides/custom-editors.md`

### Moving or renaming content

When you move, rename, or remove a page, add a redirect so that existing links and bookmarks continue to work. Add an entry in the `redirection.json` file in the corresponding content folder (`docs/`, `api/`, `blogs/`, or `remote/`):

```json
[
  { "from": "/docs/editor/old-page", "to": "/docs/editor/new-page", "status": 301 }
]
```

* `from` — the old URL path (absolute, starting with `/`)
* `to` — the new URL path or an external URL (starting with `https://`)
* `status` — use `301` for permanent moves (most cases) or `302` for temporary redirects

### sitemap

The code.visualstudio.com sitemap is authored in `/build/sitemap.xml` and should be updated when new topics are added or existing content moved or renamed.

## Formatting

### Headings & Right Nav

H2 subheadings (`##`) appear in the right-hand navigation panel of documentation pages.

> [!TIP]
> Include H2 subheadings to help users quickly scan the document structure and navigate to major topics.

**Example structure:**

```markdown
# Main Topic Title (H1)

## Ge