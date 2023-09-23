---
layout: project
type: project
image:  img/techfoliodesigner.png
title: "TechFolio Designer"
date: 2018
labels:
  - Electron
  - Desktop Application
  - React
  - Redux
summary: TechFolio Designer is a desktop application to support the creation and management of professional portfolios. 
---
TechFolio Designer (TFD) is a cross-platform desktop application, implemented using [Electron](https://electronjs.org/), which is intended to simplify the management of your professional portfolios. 

Prior to the development of TFD, creating a personal TechFolio required choosing between the following:

  1. Edit TechFolio files in the cloud using GitHub's browser-based editing tools.  This requires no setup, but browser-based editing is very primitive and error-prone. In particular, it is very easy to make mistakes while editing the bio.json file.
  
  2. Edit TechFolio files locally. This requires you to use a git client (so that you can download the files to edit, and upload them back to GitHub after you've finished), and to use an IDE to edit the files. This requires some sophistication with git as well as knowledge of an IDE. In addition, as the IDE does not "know" about the structure of TechFolio files, it is still relatively easy to make errors.  
  
TFD provides a third alternative, one where the desktop application builds in knowledge about TechFolio portfolios and the need to use git to host them at GitHub. This means:
  
  * TFD provides a simplified interface to Git and GitHub. After authenticating, TechFolio provides simple menu commands to obtain your portfolio files from GitHub for editing and to upload them back to GitHub for publication. 
  
  * TFD provides editors for Projects and Essays. Since these editors are designed to be used only for TechFolio files, they can build in knowledge about Markdown and YAML front matter to prevent common problems.
  
  * TFD provides a simplified, form-driven user interface for editing the bio.json file. This ensures that the JSON file syntax is maintained.  

TFD is still under initial development, and does not yet implement all of the potentially helpful features such an application could have. 
