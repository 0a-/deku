
0.0.20 / 2015-01-29
==================

 * Value attribute gets a special case in the diff
 * Using raf-loop instead of local module
 * Using uid module

0.0.19 / 2015-01-25
==================

 * Moved to browserify for the build

0.0.18 / 2015-01-25
==================

 * Fixed event delegation
 * Added some super basic perf tests
 * Fixed issue with scene not removing listeners

0.0.17 / 2015-01-24
==================

 * Fixed bug when changing root node. Closes #33

0.0.16 / 2015-01-23
==================

 * Fixed issue with channels not being sent to render

0.0.15 / 2015-01-23
==================

 * Added .channel and .prop methods
 * Removed .send and .onMessage in favour of channels
 * Scene is no longer immediately rendered

0.0.14 / 2015-01-21
==================

 * Add .send and .onMessage methods. You can call this.send(name, payload) within components and listen for those events on the scene with scene.onMessage(name, fn); 

0.0.13 / 2015-01-20
==================

 * Fixed a bug with IDs being identical
 * Added History.md

0.0.12 / 2015-01-19
==================

 * Add repo field
 * Updated bump
 * Updated release task
