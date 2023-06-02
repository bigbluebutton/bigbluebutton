---
layout: page
title: 'Accessibility'
category: 2.5
redirect_from: '/dev/accessibility.html'
date: 2015-04-05 11:41:36
order: 9
---

The BigBlueButton HTML5 client is WCAG 2.0 AA accessible (with exceptions) and Section 508 compliant. See our [official accessibility statement](https://bigbluebutton.org/accessibility/).

## Overview

Based on the scope of the project, focus has been placed on disabilities related to visual, auditory and motor impairments.
We have designed the BigBlueButton HTML5 client to be accessible to as many users as possible regardless of any underlying disability.

The client follows the WCAG 2.0 color contrast guidelines for all visual elements, in addition to an aesthetically pleasing inclusive design.
Keyboard and screen reader support has been improved, in particular for the open source NVDA screen reader. JAWS, the markets leading paid screen reader software is also compatible with the client.

**_Note:
There are a few minor controls within the client that are not fully accessible, The colour picker in the closed caption settings for example._**

## Accessibility

When dealing with web accessibility there are a few key factors we must keep in mind while developing

1. Tab Order
2. Color Contrast
3. Focus
4. Semantics
5. Testing

### Tab Order

The goal when implementing the tab order is ensuring the elements in the tab sequence are logical and simple.

When a user presses the tab key focus should move to the next interactable element. If the user continues to press the tab key, focus should move in a logical order through all the interactable elements on the page. The tab focus should be visually identified, currently the HTML5 client adds a thin border to the field, when tab is pressed focus is seen to visibly move.

**_Note: A number of users including the following._**

- **_Those with visual impairments, who rely on screen readers or screen magnifiers._**
- **_Those with limited dexterity, who depend on the use of the keyboard to using a mouse._**
- **_Those who can only utilize a single switch to control a computer._**

**_will all navigate through a page by using the tab button._**

The order of elements in the DOM determine their place in the tab order, for elements that should receive focus. Elements that don’t natively receive focus can be inserted into the tab order by adding a tabindex=”0” property.

**_Caution:_**
**_When using the tabindex property, positive values should generally be avoided because it places elements outside of the natural tab order, this can present issues for screen reader users who rely on navigating the DOM through a linear manner._**

The following extension gives a visual representation of the tab order of a current web document.

#### ChromeLens

offered by ngzhian

![Screenshot of ChromeLens a browser extension to aid in website accessibility testing](/img/accessibility_chromelense.jpg)

https://chrome.google.com/webstore/detail/chromelens/idikgljglpfilbhaboonnpnnincjhjkd?hl=en

### Focus

Determines where keyboard events go on the page at any given moment. It is represented visually by a ring around the focused element and important for users to distinguish what element on the screen they currently have selected. The interactive elements in the html5 client UI have a custom focus ring applied to them.

![Image showing an icon with focus and an icon without focus](/img/accessibility-focusring.jpg)

HTML5 by default uses the `outline` attribute to visually indicate focus. Due to it's limitations the outline is set to transparent so it is only becomes visible in window high contrast themes (for those with visual impairments related to color).

![Image showing join audio aria label over the join audio icon](/img/accessibility-focusring-hc.jpg)

Aria labels are important to focus when navigating with a screen reader, these labels have been used extensivley through out the client to provide audible announcments for selected
elements.

#### Keyboard Navigation

The HTML5 Client has made several improvements to the default keyboard navigation. The most notable addition being breakout room managment, assigning users to various rooms is now possible.

![Animated image showing assignment of users to different rooms](/img/accessibility-br-manage.gif)

#### Keyboard Shortcuts

There are a number of provided keyboard shortcuts which have been set up using HTML5's `accessKey` property.

|   Combination   | Function                                    |
| :-------------: | :------------------------------------------ |
| Shift + Alt + O | Open Options                                |
| Shift + Alt + U | Toggle UserList                             |
| Shift + Alt + M | Mute/Unmute                                 |
| Shift + Alt + J | Join Audio                                  |
| Shift + Alt + L | Leave Audio                                 |
| Shift + Alt + P | Toggle Public Chat (User list must be open) |
| Shift + Alt + H | Hide Private Chat                           |
| Shift + Alt + G | Close private chat                          |
| Shift + Alt + R | Toggle Raise Hand                           |
| Shift + Alt + A | Open actions menu                           |
| Shift + Alt + K | Open debug window                           |
|    Spacebar     | Activate Pan tool (Presenter)               |
|      Enter      | Toggle Full-screen (Presenter)              |
|   Right Arrow   | Next slide (Presenter)                      |
|   Left Arrow    | Previous slide (Presenter)                  |

**_Note: the accessKey attribute has certain limitation like not being able to set the modifier key to activate the shortcut._**

**_The benefit is the visibility it provides for screen readers about available shortcuts._**

### Color Contrast

When dealing with color contrast we are talking about finding colors for a scheme that not only implement maximum contrast, but gives the appropriate contrast between the content and its background for those who experience low visual impairments, color deficiencies or the loss of contrast typically accompanied by aging.

The HTML5 client ensures that all visual designs meet the minimum color-contrast ratio for both normal as well as large text on a background, described by the WCAG 2.0 AA standards. “Contrast (Minimum): Understanding Success Criterion 1.4.3.”

To make sure that we have met these guidelines, there are numerous tools available online which allow the comparison of foreground and background colors using hex values, to see if they fall within the appropriate contrast ratio.

![Image showing contrast ratio calculator](/img/accessibility_colorchecker.jpg)

https://webaim.org/resources/contrastchecker/

#### Currently implemented colors:

![Image showing currently implemented element colors](/img/accessibility_colors1.jpg)
![Image showing currently implemented typography colors](/img/accessibility_colors2.jpg)

- Blue - primary color - action buttons
- Red - closing audio, indicators and error alerts
- Green - audio indicator, success alert, check marks
- Orange - warning alerts
- Dark Blue - Headings
- Grey - base typography color

**_Note:_**
**_The ChromeLens extension also provides the ability to view your browser using different personas of users who may view web content with various different visual impairments. This is particularly useful when deciding on appropriate color schemes to best suit a wider range of users._**

### Semantics

Users with visual disabilities can miss out on visual affordances. We need to make sure the information we are trying to express, is expressed in a way that flexible enough so assistive technology can pick up on it; creating an alternative interface for our users. we refer to this as expressing the semantics of an element.

The HTML5 client uses the WAI-ARIA (Web Accessibility Initiative – Accessible Rich Internet Applications) to provide access to screen readers. The following list of commonly used aria attributes:

- aria-role
- aria-label
- aria-labelledby
- aria-describedby
- aria-hidden
- aria-live
- aria-expanded
- aria-haspopup

##### Links

HTML5 ARIA spec - https://www.w3.org/TR/aria-in-html/

ARIA spec - https://www.w3.org/WAI/PF/aria/

Roles - https://www.w3.org/TR/2023/WD-dpub-aria-1.1-20230515/#role_definitions

States and Properties - https://www.w3.org/TR/wai-aria-1.0/states_and_properties

Design Patterns - https://www.w3.org/TR/wai-aria-practices/#aria_ex

#### Testing

Testing for accessibility can be a somewhat painful process, if you try to manually find and fix all the issues. While it is good practice to go through a checklist and ensure all elements in the HTML5 client meet their accessibility requirements, this process can be very slow and time consuming. For this reason it is suggested to use an automated accessibility auditor first.

##### aXe

Offered by Deque Systems

![Image of aXe browser extension accessibility checker](/img/accessibility_axe.jpg)

https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd

##### Accessibility Developer Tools

offered by Google Accessibility

![Image of Google browser extension accessibility developer tools](/img/accessibility_audit.jpg)

https://chrome.google.com/webstore/detail/accessibility-developer-t/fpkknkljclfencbdbgkenhalefipecmb

Both of these extensions provide the ability to scan the DOM and report on any accessibility issues based on levels which can be set, weather AA or AAA standards. For the purposes of the HTML5 client we follow the AA guidelines. Any reported errors also come with a listing of potential fixes.

**_Note:_**
**_Once these extensions are installed to the browser they must be run from inside the console._**

### Training

We recommend checking out this [free online accessibility course](https://www.udacity.com/course/web-accessibility--ud891) which can provide a very good understanding of the basics of dealing with web accessibility for both developers and designers.

In the event you do not need to take the course but would still like access to the information as reference, the course is also found in [full document form](https://developers.google.com/web/fundamentals/accessibility) . It is a live document which is updated by the developers over at Google.
