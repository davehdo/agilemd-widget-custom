### Contributing to this project

We are glad you want to get involved and welcome your contributions to our source code. There are always more good ideas than there is time to implement them!

Before contributing, please take a moment to review this document as well as our [style guide](https://github.com/agilemd/widget/wiki/Style-Guide). Following these standards helps everyone easily respond to requests and quickly resolve new issues.

Finally, you need a [GitHub account](https://github.com/join) to contribute to this project. Free accounts are available.


### Issues

We use GitHub Issues to track and manage project changes while coordinating delivery targets for published releases using [milestones](https://github.com/agilemd/widget/milestones).

Before filing a new issue, verify that a similar request does not yet exists by browsing [open issues](https://github.com/agilemd/widget/issues). We expect all non-trivial commits to be associated with an open issue.

If you desire a new feature, find a bug, or identify an opportunity to improve our documentation, please submit an issue to this repository. Better yet, submit an issue as well as a [pull request](https://help.github.com/articles/using-pull-requests) for our team to review. For larger features, it is best to open a `question` issue first to discuss the idea with our team. Otherwise, you may invest significant time in something that is never merged because it is not in the best interest of the broader community.

To reduce review time and encourage discussion, we provide a template for two common issue types:

- New feature or enhancement
- Bug report

Do not create issues for personal support requests. Instead email support@agilemd.com.


### Pull requests


1. [Fork](https://github.com/agilemd/widget/fork) the project, clone your fork, and configure an upstream remote.

   ```bash
   git clone https://github.com/<your-username>/widget.git
   cd widget
   git remote add upstream https://github.com/agilemd/widget.git
   ```

2. Always get the latest changes from upstream before making changes.

   ```bash
   git checkout master
   git pull upstream master
   ```

3. Create a new branch for the issue in question.

   ```bash
   git checkout -b <issue-title>
   ```

4. Commit your changes in logical chunks. Attach short, clear commit messages. If needed, use Git's
   [interactive rebase](https://help.github.com/articles/about-git-rebase) feature to condense commits before making them public. Never rebase previously pushed history. We would rather error on the side of a few "work-in-progress" commits than risk rewriting the global project history.

5. Locally merge (or rebase) the upstream master branch into your topic branch.

   ```bash
   git pull [--rebase] upstream master
   ```

6. Push your topic branch up to your fork.

   ```bash
   git push origin <topic-branch-name>
   ```

7. Open a pull request with a well-articulated title and helpful description.
