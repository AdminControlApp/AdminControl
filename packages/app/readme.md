# Admin Control Electron App

## Why Electron?

Electron has a negative reputation for bloated applications, and I completely understand it. But, for the purposes of this project, Electron was the best tool for the job.

For one, a lot of the utilities involved with AdminControl (e.g. phone-call-input) are already written in JavaScript/TypeScript, and I'm not interested in rewriting all my utilities in another programming language.

I've tried setting up interop between Swift and JavaScript by using Rollup to bundle my utilities into a few files and including Node inside the macOS application, but this process in extremely painful and tedious.

In addition, I don't like using Xcode to create applications. I find VSCode and file-based editing much more productive than the point-and-click nature of Xcode. I find myself dreading using Xcode, which is not a mentality I want to have when working on a project like Admin Control that should optimally be completed as soon as possible.
