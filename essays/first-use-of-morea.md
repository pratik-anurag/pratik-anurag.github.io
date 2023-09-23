---
layout: essay
type: essay
published: true
title: Reflections on my first use of the Morea Framework
date: 2014-05-23
labels:
  - Morea Framework
  - Athletic Software Engineering
---

<img class="img-fluid" src="{{ site.baseurl }}/img/first-use-of-morea.png">

Last summer, I had <a title="Athletic Software Engineering Education" href="http://philipmjohnson.org/2013/07/12/athletic-software-engineering-education/">the idea of teaching in an athletic style</a>, and last fall, I tried it out in my <a href="http://ics314f13.wordpress.com/">software engineering course</a>. My <a title="Athletic Software Engineering Education: Initial Results" href="http://philipmjohnson.org/2013/12/16/athletic-software-engineering-education-initial-results/">experience teaching this way</a> led to a new idea: using GitHub, Jekyll, and Twitter Bootstrap to: (a) make it easier for teachers to develop course materials and (b) provide a higher quality experience for students. I started this project in January and the resulting <a href="http://morea-framework.github.io/">Morea Framework</a> has achieved its 1.0 release.<!--more-->

To help assess (and debug) the Morea Framework, I migrated my course materials from the <a href="http://ics314f13.wordpress.com/">original ICS 314 WordPress site</a> to a <a href="http://philipmjohnson.github.io/ics314f13/">new site based upon Morea</a>.  This took 10 days working an hour or two per day. The new site organizes the material into 19 modules, 24 outcomes, 98 readings, 73 experiences, and 41 assessments. (Actually, the new site contains a new "meta-module" which collects together all of the writings and data on athletic software engineering, so the class material actually requires 18 modules.)  Here are some initial thoughts from that migration experience.

<strong>Morea is better than WordPress (for this application area)</strong>

I think it is pretty undeniable that the <a href="http://philipmjohnson.github.io/ics314f13">new ICS 314 site</a> is better than the <a href="http://ics314f13.wordpress.com/">old one</a> from a structural, aesthetic, and developmental point of view. Structurally, the Morea Framework presents the course material in five separate views (Modules, Outcomes, Readings, Experiences, and Assessments) with links representing the various relationships between them.  The original site, for example, contains the readings for each module in each module's page, which means it can be difficult later to find a reading since the entire set of readings is strewn across 20+ pages.

The basic reason Morea is structurally better than WordPress is that the fundamental "unit of abstraction" in WordPress is a web page. In contrast, Morea represents each module, outcome, reading, experience, and assessment as its own file with its own unique ID.  The Jekyll generator creates web pages from these files. This allows you, for example, to define an outcome once in a single file, but have it appear on multiple web pages in the generated site, which would be quite difficult to do in WordPress.

While aesthetics are somewhat subjective, I am confident that a usability study would find a preference for the Morea version of the course. I believe the Morea version uses the available screen real estate more effectively (than the theme I chose in WordPress).  I believe it is easier for users to find course materials in Morea than WordPress.  The site displays very well on a mobile phone. Similar to WordPress, Morea offers a <a href="http://morea-framework.github.io/userguide.html#Themes">selection of pre-built themes</a>. Users with HTML/CSS/Bootstrap expertise can design their own.

Finally, Morea is a huge win over WordPress when it comes to development and reuse.  Morea uses the <a href="http://jekyllrb.com/">Jekyll </a>static site generation system and <a href="http://daringfireball.net/projects/markdown/">Markdown</a>, which simplifies development. More significantly, I have taught my software engineering course several times using WordPress sites, and each iteration required a very tedious process of rebuilding the new course from scratch by cutting and pasting previously developed text and images. Since Morea uses GitHub as its backing repository, creating a new instance of a course based upon old material is dramatically easier: just clone the old course into a new repository, edit materials, and regenerate. All cutting and pasting is eliminated.  Here is the <a href="https://github.com/philipmjohnson/ics314f13">GitHub repository for the ICS 314, Fall 213 course</a>.

<strong>Learning outcomes are actually useful</strong>

I've been paying lip service to learning outcomes in my courses for a while. I've included them in module descriptions and summarized them in introductory materials. It's remotely possible that students found them useful, but I definitely didn't.  To my utter surprise, the Morea Framework makes the articulation of learning outcomes both interesting and insightful.

Morea makes learning outcomes interesting because each outcome is essentially an independent "object" that can be attached to multiple modules.  This means you can easily indicate, for each learning outcome, which modules in the course presented material related to it.   That's good, but it gets better.  Morea also allows you to represent "assessments" (more colloquially, "tests"), and indicate which learning objectives were evaluated through the assessment.  The result is that Morea not only allows you to present the learning outcomes for a course, but also shows how frequently any given outcome is present in the modules, as well as how frequently an outcome is assessed.  Here's an example from ICS 314:

<img class="img-fluid" src="{{ site.baseurl }}/img/first-use-of-morea-2.png">

The page shows two of the two dozen learning outcomes for ICS 314: "Create a professional portfolio" and "Create high quality technical writing."  You tell me: which one of these learning outcomes is emphasized more in the course?  Furthermore, Morea distinguishes between outcomes that are "associated with" modules and outcomes that are "assessed"--- i.e. important to a student's final grade.  If one is attempting to predict what learning outcomes students will acquire for the long term from a course, my bet is that those that are emphasized and assessed more often will have higher odds of being assimilated.

While there are heuristics such as <a href="http://en.wikipedia.org/wiki/Bloom's_taxonomy">Bloom's Taxonomy</a> that help you describe learning outcomes, I still believe it is very much a "goldilocks problem" --- you don't want them to be too high level (because then they won't be meaningful), nor do you want them to be too low level (because that could easily lead to 100 or more outcomes for a course and overwhelm both student and instructor). You want them to be "just right": low enough to be meaningful, high enough for at least some of them to be "thematic" and appear multiple times in the course. And you want them to be coherent when presented together.

I make no claims that the <a href="http://philipmjohnson.github.io/ics314f13/outcomes/">set of outcomes for ICS 314, Fall 2013</a> achieves all of these goals, but I can say that the framework has led me to put more effort into their description and that the results are providing actionable insight into how to improve my next iteration of the course.

<strong>Morea has limitations</strong>

Here are a couple of the most obvious; I am sure there are more.

<em>Morea is not a full-fledged learning management system (LMS) like Laulima, Blackboard, etc.</em>

It does not provide out-of-the-box support for a grade management system, or discussion groups, or quiz bank.  Due to its use of static site generation technology, it is unlikely to provide interactive or personalization features that would require back-end database support (although you could implement any of these features via a technology like <a href="http://nodejs.org/">node.js</a> if you really wanted to.)  I've never found those "advanced" LMS features to be as good as Excel, Google Discussion Groups, etc. and so I'm not personally motivated to add them to Morea.

That said, Morea supports "loose coupling" with other educational technology components. For example, the ICS 314 site extends the basic template with two additional navbar links: one to the course's Google Discussion group, and another to a page containing a JQuery plugin to display the course calendar.

<em>Morea requires some technological sophistication.  </em>

To use Morea, you must be comfortable with git and GitHub. You must be able to install Jekyll.  You must be able to run scripts from the command line. You must be able to write using Markdown rather than a WYSIWYG editor.

<em>Morea supports courses with a module-outcomes-readings-experiences-assessments structure.</em>

Not all courses fit into the Morea mold, and that's fine. Morea provides "graceful degradation", in the sense that if you choose not to use a particular abstraction (for example, "assessments"), then the generated site will not contain any references to them.  You probably need to use at least three of the five abstractions in order for Morea to be useful to you.

Finally, while Morea is by intention more generic than the athletic software engineering pedagogy that inspired it, it is not some kind of silver bullet.  Your mileage will vary.
