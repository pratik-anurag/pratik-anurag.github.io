---
layout: essay
type: essay
published: true
title: Why and how to create a high quality Ph.D. portfolio site
date: 2019-11-25
labels:
---

One of the requirements of the Ph.D. program in the Department of Information and Computer Sciences at the University of Hawaii is to create an online portfolio site which establishes "research readiness and professional capacity". The portfolio site should include, at a minimum, four statements:

  1. Statement of purpose
  2. Evidence of core competency
  3. Evidence of scholarly ability
  4. Other evidence of professional capacity

Details for the requirements of each of these four sections can be found [here](http://www.ics.hawaii.edu/welcome/academics/graduate-degree-programs/ph-d-in-ics/#phd-portfolio).   The goal of this essay is to provide motivation for *why* you should create a high quality portfolio, and heuristics for *how* to do so.

## Why develop a high quality portfolio?

Some students might find this exercise to be a distraction from their research activities. Why spend time to talk about what you're doing when you could instead be doing it? And why package it up as an online portfolio? Here are four reasons:

**1. You need to provide this information to employers after you graduate.**  First, and most importantly, jobs for people with a Ph.D. in Computer Science, whether in academia or industry, are qualitatively different from jobs for people with a B.S. in Computer Science. If you only have an undergraduate degree, the expectation is that you will be (primarily) responsible for carrying out projects designed by others. On the other hand, a person with a Ph.D. is expected to be able to define new projects at or beyond the state of the art in their chosen field. By definition, a person with a Ph.D. should be the world's expert on some (very narrowly defined) topic, and capable of quickly becoming a leader in a variety of areas related to the area covered in their dissertation.

If you examine the requirements for the portfolio, you will see that the information you will present is exactly the kind of information future employers will want to know about an applicant for a Ph.D.-level position. Indeed, a "statement of purpose" is a standard component of an application for an academic position.

Developing your portfolio is not a "distraction". It is a first step toward defining your future employment prospects.

**2. Developing your portfolio is a self-assessment.**  What is your professional purpose?  No, seriously, what is it? Have you spent much time thinking about what you want to be doing five (or even ten) years after you receive your Ph.D.? Chances are you haven't, and are still getting used to simply being a Ph.D. student.  Developing your portfolio is our way of forcing you to spend at least a little time thinking about the "forest" rather than the "trees".  We want you to look up from your debugger for a few minutes, and think strategically about your career.  Where do you want to head at this point? What is your vision?

In addition, actually achieving a Ph.D. requires you to demonstrate your ability to innovate in a field of study.  That demonstration normally requires you to be able to show how your work relates to other work in the field (i.e. a literature review), and show that experts in the area have reviewed your work and found it to provide a contribution (i.e. a publication in a peer reviewed conference or journal).  The portfolio requirements provide a mechanism for you to self-assess: are you efficiently working toward a Ph.D.? If not, what do you need to allocate time and resources on?

**3. Your portfolio is a communication tool.**  Chances are, at least some ICS faculty have not had the chance to become acquainted with you, your research interests, your background, and your future directions.  The Ph.D. portfolio evaluation process enables all of the ICS faculty to quickly learn about you and your professional interests and accomplishments.  This can lead to new opportunities for collaboration and/or networking. For example, I have provided professional introductions of my colleagues to students I did not know previously, based solely on learning about them through their portfolios.

**4. In the modern job market, those without a high quality portfolio are at a disadvantage.** I hate to say it, but many faculty haven't had to compete in the job market for many years or even decades.  This includes myself.  So, you are right to be sceptical of professors who say a portfolio is important (or conversely, that a portfolio isn't important). Instead, I recommend you value the opinion of Gayle McDowell, the author of [Cracking the Coding Interview](http://www.crackingthecodinginterview.com/), a book about the high tech job market based upon interviews and communications with hundreds of individuals and companies.  She created a "preparation map" indicating how to get ready, and a central part of this preparation process, starting at least a year prior to graduation, is the development of a "website / portfolio showcasing your experience":

<figure>
<img class="img-fluid" src="{{ site.baseurl }}/img/preparation-map.png">
<figcaption style="text-align: center">A portion of the Preparation Map in Cracking the Coding Interview</figcaption>
</figure>

A high quality portfolio is not just important for industry. As someone who has reviewed many applicants for junior faculty positions in our department, an overwhelming percentage of recent high quality candidates had high quality portfolios.

## How to develop a high quality portfolio?

Hopefully you are now convinced that it is in your best interest to create a high quality Ph.D. portfolio.  But how do you do that? Here are some tips based upon high quality (and not so high quality) portfolios that I've seen in the past.

**1. Your portfolio site should either use Techfolios, or use something even better.**  One of the perks of being a Ph.D. is to work at institutions with a relaxed (or non-existent) dress code.  That said, some standards do apply to the initial interview process.  If you show up to your interview in cut-off shorts and a torn Nirvana concert t-shirt, you might make a negative first impression on a few individuals, and in some cases, that could be enough to deny you a job offer.  To avoid this situation, most people interviewing for Ph.D. positions choose "business casual" attire so that choice of clothing doesn't influence the decision.

For similar reasons, your portfolio site should also achieve "business casual" status. It can be simple and straightforward, but it should use modern best practices for presentation and typography as implemented in frameworks like Bootstrap, Semantic UI, Material, etc.

To make it as easy as possible for ICS Ph.D. students to create a simple, "business casual" portfolio site, I implemented [TechFolios](http://techfolios.github.io/), and you can see examples of graduate student portfolios [here](https://ics-portfolios.github.io/graduatestudents/). I recommend [Anthony Christe's portfolio](https://anthonyjchriste.github.io/) as a good example of a high quality Ph.D. portfolio site.

Some of you might have the skills to create a more sophisticated portfolio site, and if so, go for it. But if you don't, then don't think a single index.html file containing only vanilla HTML is "high quality" or "business casual".  Why require every single interviewer to ignore the fact that you have presented yourself using 1990's technology?

**2. Use markdown when appropriate, and PDF links when appropriate.**

The portfolio requirements include several short 1-2 page essays.  For maximum usability, please compose these statements as markdown so that they can be read on laptops, tablets, and smart phones.  For example, here is [Anthony Christe's Statement of Purpose](https://anthonyjchriste.github.io/essays/statement-of-purpose.html).

In general, for short essays, don't create a PDF which we must then download and then open in a PDF reader.  During a recent review, some faculty were actually unable to open a student's statement because that student used PDF and the faculty member's tablet was unable to display it.

On the other hand, long documents such as literature reviews and conference/journal submissions are more appropriate as PDF. In this case, you can create an "essay" file in TechFolios and use the "essayurl" field in the header area to indicate that this entry should link directly to another file. For example, here is an example essay file that links to a PDF:

```markdown
---
layout: essay
type: essay
published: true
title: "Teaching software engineering with Meteor"
date: 2018-04-04
essayurl: https://blog.meteor.com/teaching-software-engineering.pdf
---
Teaching Meteor in an introductory software engineering class.
```

**3. Use LaTeX for your literature review.**

We recently reviewed a literature review which was a structural mess: the citation numbers went to references to the wrong articles, the font changed unpredictably during the paper, and there were misspellings and grammatical errors throughout.

A simple solution to this is to use LaTeX, which is tailor-made for CS publications and theses, in combination with a spell checker. Indeed, ICS graduate students developed a [LaTeX thesis style](https://github.com/rbrewer/latex-uhm-thesis).

Using LaTeX has many advantages. You can build a library of references and store them in a BibTex file, then cite them easily in multiple papers.  Virtually all conferences and journals in computer science accept LaTeX, and most provide a theme file that enables you to satisfy their formatting criteria trivially. Finally, since LaTeX sources are plain text, you can use collaboration tools like git to easily create co-authored documents.

If you don't yet know LaTeX, your literature review document provides a great opportunity to learn it.

Of course, you also need the content of your literature review to be high quality.  Please see the [ICS Ph.D. Literature Review Guidelines](http://www.ics.hawaii.edu/welcome/academics/graduate-degree-programs/ph-d-in-ics/literature-review-guidelines/) for more information about the content of a high quality literature review.

**4. Request a review of your portfolio prior to submission.**

For at least some faculty, your portfolio will be their first introduction to you.  In addition, creating a satisfactory portfolio is key to your advancement in the Ph.D. program.  For both of these reasons, it is very important that you get some feedback on your portfolio prior to submission.  Ask your advisor to look at it.  Ask fellow students to take a look.  In most cases, a review can significantly improve the quality of your portfolio without requiring an excessive additional investment of time on your part.
