---
layout: essay
type: essay
published: true
title: Ten ways to integrate software engineering throughout the curriculum
date: 2023-01-14
labels:
  - Software Engineering
---

ICS 314, Introduction to Software Engineering, is part of the core curriculum and is a prerequisite to almost all upper division ICS courses.  However, the concepts and technologies taught in ICS 314 can easily decay or be lost altogether if students never use them after that semester.  Recent reviews of ICS have indicated that students would benefit from an increased emphasis on software engineering.

A simple way to make software engineering a "cross-cutting concern" is to reinforce various software engineering concepts that they have already been exposed to in ICS 314.  This doesn't require you to acquire specialized software engineering expertise or teach students new skills in software engineering.

This essay describes several ways for instructors of upper division courses to easily integrate software engineering concepts taught in ICS 314. This should be a win-win: the students will gain deeper insight into software engineering, and you will obtain higher quality projects from the students without additional teaching.

Here are ten recommendations. Even if you adopt just a few of them, the improvement in retention and understanding of software engineering concepts could be significant.

  1. [Require JetBrains IDEs or VS Code](#1-require-jetbrains-ides)
  2. [Require an automated coding standard](#2-require-an-automated-coding-standard)
  3. [Require GitHub for project repositories](#3-require-github-for-project-repositories)
  4. [Require project documentation, and use GitHub Pages](#4-require-project-documentation-and-use-github-pages)
  5. [Require team projects to use the IDPM agile development process](#5-require-team-projects-to-use-the-idpm-agile-development-process)
  6. [Teach ethical implications of your course topic](#6-teach-ethical-implications-of-your-course-topic)
  7. [Require updates to their professional portfolio](#7-require-updates-to-their-professional-portfolio)
  8. [Require user feedback and/or testing](#8-require-user-feedback-andor-testing)
  9. [Require a database if appropriate](#9-require-a-database-if-appropriate)
  10. [Deliver application functionality as a cloud-based service](#10-deliver-application-functionality-as-a-cloud-based-service)

## 1. Require JetBrains IDEs (or VS Code)

I have used and taught a great many different integrated development environments throughout the years.  Currently, I require ICS 314 students to learn and use the JetBrains IDE for Javascript, known as [WebStorm](https://www.jetbrains.com/webstorm/). Using the same basic platform, JetBrains also provides [Idea](https://www.jetbrains.com/idea/) for Java, [PyCharm](https://www.jetbrains.com/pycharm/) for Python, and [CLion](https://www.jetbrains.com/clion/) for C and C++.  The JetBrains family of IDEs are currently best-in-class for these languages, with superior syntax-aware editing, a fantastic debugger/inspector, arguably the best automated refactoring technology, and a vast plugin ecosystem.

JetBrains IDEs are generally acknowledged as superior to Eclipse, NetBeans, Atom, etc. The universally cited downside is that JetBrains products are subscription-based: licenses normally cost about $200/year. Fortunately, this is a non-issue for us: JetBrains provides a [free academic license to students and instructors](https://www.jetbrains.com/student/).  All of your students, having been through ICS 314, already have this license in effect and can use any JetBrains IDE. (Parenthetically, the JetBrains business model [appears to be working](https://twitter.com/chetanp/status/1205907182396395525).)

A reasonable alternative to the JetBrains family of IDEs is Microsoft's [Visual Studio Code](https://code.visualstudio.com/). VSCode is free, open source, and a better choice if you are doing Microsoft (.NET and/or C#) development. Most comparisons of the two environments result in JetBrains coming out slightly on top, with VS Code close behind. 

From a software engineering perspective, I do not believe it is in the best interest of the students to let them "use whatever IDE they want".  The IDE is, for a software engineer, analogous to the set of knives used by a chef: in both cases the tool is the most direct connection between the professional and their work product, and thus has a disproportionate impact on the quality and productivity of their work. The KCC culinary program does not let students use "whatever knives they want"; they require students to buy and use knives they have chosen as appropriate for a professional in training.

If you decide to require them to use a different IDE, be sure that the benefits of that IDE outweigh the time that will be lost as they come up to speed using it.  It might be more efficient for them to increase their facility with JetBrains as applied to the material in your course.

**How to do it:**

Tell your students that they are required to use the appropriate JetBrains IDE (or VS Code) for software development. Explain the advantages of using your chosen IDE over the alternatives, and that they can help each other better if they all use the same IDE. Periodically check during in-class development periods to see that they are using the required IDE, and use it yourself for in-class demos.

If a student has forgotten about JetBrains, refer them to the [ICS 314 Development Environments module](http://courses.ics.hawaii.edu/ReviewICS314/modules/development-environments/).

## 2. Require an automated coding standard

Most language communities have developed one or more coding standard tools that can automatically enforce various best practices for development: Java has [PMD](https://pmd.github.io/), Python has [PyLint](http://pylint.pycqa.org/en/latest/), Javascript has [ESLint](https://eslint.org/), and C/C++ has [CppCheck](http://cppcheck.sourceforge.net/).

Modern coding standard tools have gone way beyond surface syntax checking. For example, ESLint can detect situations in which you should use more modern constructs (i.e. the use of `let` or `const` rather than `var`). As would be expected, JetBrains has excellent integrated support for automated coding standards:

<figure>
<img class="img-fluid" src="{{ site.baseurl }}/img/ten-ways-eslint-example.png">
<figcaption style="text-align: center">JetBrains IDE revealing an ESLint error</figcaption>
</figure>

Good coding standards do more than improve the quality of code: they actually help novices learn the language. When I learned Javascript, ESLint taught me a lot about best practices.

**How to do it:**

Decide on the tool to use, and then create a rules file that configures it to check for the specific coding standards you wish to enforce in the course.  In 314, for example, I use a modification of the [AirBnB Javascript Coding Standards](https://www.npmjs.com/package/eslint-config-airbnb).  Show your students how to use the tool with your ruleset, and impose an appropriate grade deduction for code that is turned in with violations.  All coding standard tools have a command line interface, so it is easy to check student code against your class standard.

If a student has forgotten about coding standards, refer them to the [ICS 314 Coding Standards module](http://courses.ics.hawaii.edu/ReviewICS314/modules/coding-standards/).

## 3. Require GitHub for project repositories

Several of the software engineering practices I teach in 314 (and recommend below) require the use of [GitHub](https://github.com/). Requiring students to use GitHub provides them with a cloud-based backup service for their code. It supports collaboration and team-based development. Finally, it provides public access to their work products. GitHub is good for them, because the more high quality code they can show future employers that they've written, the more professionally attractive they become.  GitHub is good for you, because you can encourage them to develop high quality projects not just so they get a good grade in your class, but also so that they have something interesting to show future employers.

Note that GitHub has a [student developer pack](https://education.github.com/pack), which all ICS 314 students have been awarded. This comes with several dozen free developer services of potential benefit to your course.

<figure>
<img class="img-fluid" src="{{ site.baseurl }}/img/ten-ways-student-developer-pack.png">
<figcaption style="text-align: center">A sample of benefits from the GitHub Student Developer Pack</figcaption>
</figure>

**How to do it:**

Tell your students to submit their projects to you via a URL to a GitHub repository. Tell them that the project(s) they create in this course will improve their professional marketability (and of course make sure that this is true!) Utilize free services from the student developer pack if appropriate.

If a student has forgotten about GitHub, refer them to the [ICS 314 Configuration Management module](http://courses.ics.hawaii.edu/ReviewICS314/modules/configuration-management/)

## 4. Require project documentation, and use GitHub Pages

[GitHub Pages](https://pages.github.com/) is a free service that makes it easy for students to create public documentation about their projects as part of their repository, and then render it with a choice of various HTML themes. In ICS 314, students learn what is appropriate to include in project documentation, such as an overview of the problem the application is intended to address, a user guide showing screenshots of each page and functionality in the system, a developer guide explaining how to download, install, and run the system, results from any user feedback on the system, the development history of the system, and how to contact the developers. They also learn how to format and publish this information using GitHub Pages.

For example, here is the first section of the project documentation for an ICS 314 final project called Studious Manoa, available at [https://studious-manoa.github.io/](https://studious-manoa.github.io/):

<figure>
<img class="img-fluid" src="{{ site.baseurl }}/img/ten-ways-studious-manoa.png">
<figcaption style="text-align: center">First section of the Studious Manoa project home page</figcaption>
</figure>

Part of the benefit of using GitHub Pages is that the documentation source files are stored along with the source code for the project in a single repository, making it more straightforward to keep the documentation in sync with the system.

**How to do it:**

Tell your students that they need to provide comprehensive documentation on their project, and that this documentation should be published using GitHub Pages. Tell them that the ability to produce project documentation is an important skill, and that a high quality example can be of value to them professionally.

If a student has forgotten what is involved in project documentation, refer them to the [ICS 314 Agile Project Management module](http://courses.ics.hawaii.edu/ReviewICS314/modules/project-management/).

## 5. Require team projects to use the IDPM agile development process

In their final essays on what they found most valuable about ICS 314 with respect to software engineering, the most common answer was learning how to manage team-based work using Issue Driven Project Management (IDPM).  Issue Driven Project Management is an agile software development process I designed specifically for undergraduate team-based software development in a classroom setting using GitHub. In a nutshell, IDPM consists of the following:

  1. Students organize project work as a sequence of milestones.
  2. Within each milestone, work is organized as a set of tasks.
  2. Tasks should require no more than 3-4 days to finish.
  3. Each task is the responsibility of a single team member.
  4. Each task is documented and tracked using a [GitHub Issue](https://help.github.com/en/github/managing-your-work-on-github/about-issues).
  5. Work for each task is carried out in a branch called Issue-XX, where XX is the Issue number.
  5. Progress on the tasks associated with each milestone is represented using a [GitHub Project Board](https://help.github.com/en/github/managing-your-work-on-github/about-project-boards) with the "automated Kanban setting", which establishes three states: To Do, In Progress, and Done.
  7. When a Task is completed, the associated GitHub Issue is closed, and the issue is (automatically) moved to the Done column in the Project Board.  The team member must now merge the branch containing the work for that issue into the Master branch.
  6. At all times, each team member is working on exactly one task (i.e. each team member has one In Progress task).
  7. At all times, there is at least one Task in the To Do state per team member. This means that when a team member finishes their current Task, they can immediately assign themselves their next Task by picking one from the To Do column. There is no need for a meeting.
  8. There is no need to plan out further than 1 week. Teams must meet face-to-face at least once a week, at which point they add new Tasks and/or revise existing uncompleted Tasks to reflect the current state of development.
  9. Development is "time-boxed": when the Milestone due date occurs, the contents of the Master branch becomes the deliverable for the Milestone. Any In progress and To Do issues are moved to a new Project Board created to track progress on the next Milestone. The "Done" column of the Project Board for the current milestone provides a record of what was accomplished during that milestone, and who did what.

Here is a screenshot of a Project Board for Milestone 3 of the Bowfolios project, which illustrates various aspects of IDPM. (This project has only a single developer, me!):

<figure>
<img class="img-fluid" src="{{ site.baseurl }}/img/ten-ways-idpm.png">
<figcaption style="text-align: center">Project Board for Milestone 3 of Bowfolios project</figcaption>
</figure>

Students comment that prior to ICS 314 and IDPM, they had no effective, structured way to work with others that: (a) allowed for incremental, just-in-time planning; (b) enabled clear assignment of tasks and accountability; (c) facilitated concurrent development (through use of Git branching and merging); (d) made the status of development visible and clear (through Project Boards); and (e) provided a realistic  definition of "deliverable" for each intermediate Milestone due date.  Some claimed they would never have completed their team projects without IDPM.

Note that IDPM is useful to you as an instructor, as it makes visible the organization of each team's development process, what they are planning to do, what each member is currently (supposed to be) working on, and some insight into what each member has accomplished.  IDPM makes it painfully obvious, both to you and to the team, when a team member is not contributing anything.

All that said, IDPM is a nontrivial process, and not all students may feel competent with it after just a single exposure in 314.

**How to do it:**

Implementing IDPM in your class will likely require some preparation on your part if you are not comfortable with GitHub Issues, branching and merging, and Project Boards.  You might want to start by perusing the Readings section of the [ICS 314 Agile Project Management module](http://courses.ics.hawaii.edu/ReviewICS314/modules/project-management/). My [14 minute screencast](http://courses.ics.hawaii.edu/ReviewICS314/morea/project-management/reading-screencast-idpm.html) introducing IDPM might be helpful.

Next, you'll need to structure your final project such that students are organized into teams, and are required to deliver at least one intermediate and one final Milestone. Tell them they will need to use IDPM to manage their project, and that you will be using their Project Boards to gain insight into their development process.

Many students might feel "rusty" with IDPM if it has been a while since they've used it. That's to be expected: simply refer them to the [ICS 314 Agile Project Management module](http://courses.ics.hawaii.edu/ReviewICS314/modules/project-management/) to refresh their memory.

## 6. Teach ethical implications of your course topic

In student reviews of ICS 314, they frequently cite the material in the [ICS 314 Ethics module](http://courses.ics.hawaii.edu/ReviewICS314/modules/ethics/) as one of their most important learnings related to software engineering. This is very encouraging!

From this feedback, I infer that students will be receptive and interested in the ethical implications of other computer science topics beyond software engineering, and so you might want to consider integrating the ethical issues associated with your course topic into your syllabus.

**How to do it:**

You can review the [ICS 314 Ethics module](http://courses.ics.hawaii.edu/ReviewICS314/modules/ethics/) for ideas.  Of particular interest might be the seven "Foundation" readings (which are adapted with permission from a module by Shannon Valor and Arvind Narayanan at Santa Clara University), as well as the [ACM Code of Ethics](https://www.acm.org/code-of-ethics).

In ICS 314, I have students do a set of readings on a topic (in one semester, it was about Facebook and data privacy), and then split into teams to debate the pro and con of a question (for example, "Am I ethically obligated to delete my Facebook account?").  Assertions either pro or con should be backed up by reference to the Code of Ethics.  This format worked quite well and most students seemed to gain new insights into ethics as a result.

## 7. Require updates to their professional portfolio

All students in ICS 314 are required to create a professional portfolio using [TechFolios](http://techfolios.github.io/). One advantage of TechFolios is that it becomes straightforward to implement a script to aggregate together ICS student portfolios into a single site, which I've done and the results of which are available at [https://ics-portfolios.github.io/undergrads/](https://ics-portfolios.github.io/undergrads/).

For students, professional portfolios have many advantages, including:

  * It provides more detail about professional skills than a resume or LinkedIn profile.
  * It is seen as a positive distinguishing characteristic for job applicants by many recruiters.
  * It helps students identify their strengths and weaknesses.

On the last day of ICS 314, I encourage students to think about all of their future ICS classes in terms of "what will this course enable me to add to my professional portfolio?"  There are two general answers:

  1. The additional of one or more essays on a technical topic.
  2. The addition of one or more project pages, each of which overviews a project done during the course and the professional skills that the student acquired through that work. It also provides a link to the GitHub repository containing the code developed for the project.

One way to help our students is to design your courses such that there is an "outcome" appropriate for inclusion in their professional portfolio, and then help them to make a high quality addition to their portfolio regarding this outcome. This has implications beyond software engineering.

**How to do it:**

If your course involves the writing of a paper, then require them to submit that paper to you as a link to an essay in their professional portfolio.  Note that you may need to stress that this outcome should be written for a general audience, not just for the professor, and should not assume prior knowledge about the class.  (In my experience, these criteria usually increases the quality of the paper.)

If your course involves the development of a project, then require them to submit their project to you as a link to a project page in their professional portfolio. Once again, you may need to stress that the documentation should be designed for a general audience, not just for you or for fellow class members.

If a student has forgotten about professional portfolios, you can refer them to the [ICS 314 Professional Persona module](http://courses.ics.hawaii.edu/ReviewICS314/modules/professional-persona/).

## 8. Require user feedback and/or testing

If your course involves application development for users, it is a game changer for students to actually hear what real users say about their system. Even if there aren't "users", the development of tests is a significant quality assurance process.

**How to do it:**

The technology for testing and user experience assessment can be quite contextual.  You will likely need to develop this material yourself. That said, you might find the ICS 314 modules on [testing](http://courses.ics.hawaii.edu/ics314s21/modules/testing/) and [usability evaluation](http://courses.ics.hawaii.edu/ReviewICS314/modules/usability-evaluation/) to be of use.

## 9. Require a database if appropriate

Don't be afraid to require your students to design and implement a database as part of their project.  In ICS 314, almost none of the students had any prior experience with databases, and I provided a reasonable overview in a [one week module on MongoDB](http://courses.ics.hawaii.edu/ReviewICS314/modules/mongo/).

Hopefully, your situation will be better: by the time they have taken your course, they might have completed ICS 321, and will have much more facility with databases.

**How to do it:**

Do not be dissuaded from requiring a database just because some students have not taken ICS 321.  As long as they have taken ICS 314, they are able to create databases.

If a student has forgotten how to create a database, you can refer them to the [ICS 314 module on databases](http://courses.ics.hawaii.edu/ReviewICS314/modules/mongo/), which presents basic concepts of MongoDB databases.

## 10. Deliver application functionality as a cloud-based service

ICS 314 teaches students how to create and manage [Digital Ocean droplets](https://www.digitalocean.com/products/droplets/), which are very cheap ($5/month) virtual machines. In 314, these droplets are used to host a Meteor-based web application, but your course could use this skill for other purposes: for example, a web application built using some other tech stack, an online API providing a service or data collection endpoint, or any other application that benefits from online availability of cloud-based compute and storage resources.

**How to do it:**

If the student has forgotten how to use Digital Ocean droplets, you can refer them to the [ICS 314 module on deployment](http://courses.ics.hawaii.edu/ics314s21/modules/deployment/), which explains how to set up a droplet, how to provide it with a custom domain name (bought through a service like NameCheap), and how to set up HTTPS encryption.
