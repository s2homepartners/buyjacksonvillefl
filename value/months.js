/* Monthly themes for the mailer / pop-by landing page at buyjacksonvillefl.com/value/
   The page shows the theme for the current month (Jacksonville time) and switches on
   the 1st automatically. Before the first month listed it shows the first one; after
   the last one it keeps showing the last one until a new month is added.
   Every lead is tagged with the month of the theme that was showing.

   To add or change a month: copy one block, change the key ('2028-01'), the words,
   the colors and the art image (put it in /value/art/). Preview any month with
   /value/?month=2028-01

   Text fields may contain simple HTML (<em> colors a word in the subtitle).
   {name} in "thanks" is replaced with the person's first name. */
window.LP_MONTHS = {

  '2027-01': {
    theme: 'Monopoly',
    font: { family: 'League Spartan', google: 'League+Spartan:wght@600;700;800' },
    uppercase: true,
    colors: {
      primary: '#1A2A8C', primaryDeep: '#0F1A5E', accent: '#D9A441', accentInk: '#1A1A2E',
      heroBg: '#1A2A8C', heroInk: '#FFFFFF', heroSub: '#F5EEDC', heroMuted: 'rgba(255,255,255,.88)', eyebrow: '#D9A441',
      paper: '#FFFCF4', cream: '#F5EEDC', ink: '#1F2440', muted: '#4F5470'
    },
    title: 'New Year, New Square on the Board.',
    subtitle: 'Let&rsquo;s Find Your Park Place in <em>2027</em>.',
    lead: 'Outgrowing the house you love? Find out what it&rsquo;s worth in today&rsquo;s market. (Spoiler: it might surprise you.)',
    art: { html: 'monopoly' },
    letter: [
      'You&rsquo;ve made a lot of great memories in this beautiful house, but if you&rsquo;ve been feeling like your family is outgrowing it, this might be the year to make your move.',
      'Whether you&rsquo;re dreaming of more bedrooms, a bigger yard, or just a fresh start, I&rsquo;d love to help you figure out what your next move looks like &mdash; and what your current home is worth in today&rsquo;s market. <span class="lp-highlight">(Spoiler: it might surprise you.)</span>'
    ],
    ps: 'Keep the little house &mdash; it&rsquo;s yours. When you close on the big one, I&rsquo;ll trade you for the hotel.',
    thanks: 'You&rsquo;re on the board, {name}!'
  },

  '2027-02': {
    theme: 'Love Story',
    font: { family: 'Montserrat', google: 'Montserrat:wght@400;500;600' },
    uppercase: true,
    colors: {
      primary: '#B0567A', primaryDeep: '#8A3E5E', accent: '#F3D3DC', accentInk: '#6B2A45',
      heroBg: '#F6E8EC', heroInk: '#8A4A63', heroSub: '#B0567A', heroMuted: '#6E4B58', eyebrow: '#B0567A',
      paper: '#FFFBFC', cream: '#FBF1F4', ink: '#4A2F3A', muted: '#7A5A66'
    },
    title: 'It&rsquo;s a Love Story',
    subtitle: 'You just haven&rsquo;t met the <em>house</em> yet.',
    lead: 'Scan to see what your current era is worth.',
    art: { src: 'art/2027-02.jpg', alt: 'Pink cottage in a polaroid with a ribbon' },
    greeting: 'Hello!',
    letter: [
      'Every home is an era &mdash; first keys, first holidays, the room where everyone somehow ends up. This house has been a good one.',
      'But if you&rsquo;ve been feeling like this chapter is getting a little snug, maybe 2027 is the year you begin again &mdash; more bedrooms, a bigger yard, room for the whole story.',
      'Wear the bracelet, dream a little, and when you&rsquo;re ready to find your next great love story&hellip; you know where to find us.'
    ],
    thanks: 'This could be the start of something, {name}!'
  },

  '2027-03': {
    theme: 'Lucky Penny',
    font: { family: 'Cormorant Garamond', google: 'Cormorant+Garamond:wght@600;700' },
    uppercase: true,
    colors: {
      primary: '#5E7F3A', primaryDeep: '#465F2B', accent: '#C27A44', accentInk: '#FFFFFF',
      heroBg: '#F3F2EC', heroInk: '#5E7F3A', heroSub: '#7D9A5B', heroMuted: '#4F5A44', eyebrow: '#C27A44',
      paper: '#FFFFFC', cream: '#F4F3EC', ink: '#2F3A24', muted: '#5C6650'
    },
    title: 'Some things get more valuable',
    subtitle: 'just by sitting there. Ask your <em>house</em>.',
    lead: 'Want to know what your home is worth right now? It takes five minutes.',
    art: { src: 'art/2027-03.jpg', alt: 'Tiny house sitting on a giant copper penny with clovers' },
    greeting: 'Hello Spring!',
    letter: [
      'Fun fact: the U.S. stopped making pennies, so this little guy is officially a collector&rsquo;s item. Tape it somewhere lucky.',
      'And here&rsquo;s the thing about stuff that quietly becomes more valuable while you&rsquo;re not looking &mdash; your house has been doing the same thing. If a move to something bigger is on your heart this year, March is the golden window: spring buyers are out in force, and homes that hit the market in the next several weeks get the most eyes of the whole year.',
      'Want to know what your home is worth right now? Text me &mdash; takes five minutes, and the number might feel like finding a lot more than a penny.'
    ],
    thanks: 'Lucky you, {name}!'
  },

  '2027-04': {
    theme: 'Plant a Little Magic',
    font: { family: 'Zilla Slab', google: 'Zilla+Slab:wght@500;600;700' },
    uppercase: false,
    colors: {
      primary: '#6B6340', primaryDeep: '#4F4930', accent: '#D9B4A0', accentInk: '#3E3824',
      heroBg: '#F8F7F3', heroInk: '#6B6340', heroSub: '#B98D76', heroMuted: '#5A5643', eyebrow: '#B98D76',
      paper: '#FFFFFD', cream: '#F6F4EC', ink: '#3E3824', muted: '#66614D'
    },
    title: 'Plant a little magic.',
    subtitle: '<em>Dream</em> a little bigger.',
    lead: 'April is the moment the spring market peaks. See what your home could bring.',
    art: { src: 'art/2027-04.jpg', alt: 'Paper house with wildflowers growing from the roof and a watering can' },
    letter: [
      'Yes, this little paper house is plantable &mdash; tuck it into some soil, water it, and wildflowers will grow right out of it. Real magic, no green thumb required.',
      'And while it&rsquo;s blooming: April is the moment the spring market peaks. Buyers are everywhere right now, which means homes like yours are getting more attention &mdash; and better offers &mdash; than any other time of year. If more space has been on your mind, this is the window sellers wait all year for.'
    ],
    closing: 'Wishing you a beautiful, blooming April',
    thanks: 'Something&rsquo;s blooming, {name}!'
  },

  '2027-05': {
    theme: 'Lemonade',
    font: { family: 'Marcellus', google: 'Marcellus' },
    uppercase: true,
    colors: {
      primary: '#2B2B2B', primaryDeep: '#111111', accent: '#F2CB3C', accentInk: '#2B2B2B',
      heroBg: '#FFF8DC', heroInk: '#1E1E1E', heroSub: '#2B2B2B', heroMuted: '#4A4636', eyebrow: '#B58F0B',
      paper: '#FFFFFB', cream: '#FFFBEA', ink: '#2B2B2B', muted: '#5A5648'
    },
    title: 'When life gives you lemons',
    subtitle: 'Make a <em>move!</em>',
    lead: 'Thinking of making a move this summer? Start with what your home is worth.',
    art: { src: 'art/2027-05.jpg', alt: 'Porch with a rocking chair, lemon tree and a pitcher of lemonade' },
    letterEyebrow: 'Porch-Worthy Homemade Lemonade',
    letter: [
      '<strong>Ingredients</strong>',
      '<ul class="lp-list"><li>1 cup fresh lemon juice (about 5&ndash;6 lemons)</li><li>&frac34; cup sugar</li><li>4 cups cold water</li><li>Lots of ice + lemon slices for the pretty factor</li></ul>',
      'Warm the sugar with 1 cup of the water in a small pot, stirring just until it dissolves &mdash; that&rsquo;s your simple syrup, and it&rsquo;s the secret to lemonade that isn&rsquo;t gritty. Stir in the lemon juice and the rest of the cold water, pour over ice, and add lemon slices. Sip slowly, preferably somewhere sunny.',
      '(Sweeten it up: muddle a few strawberries in the pitcher. Fancy it up: a splash of sparkling water on top.)',
      '<strong>Thinking of making a move this summer?</strong> We are your local real estate resource and would love to help you or anyone you know.'
    ],
    thanks: 'Sweet, {name}!'
  },

  '2027-06': {
    theme: 'Stay Cool',
    font: { family: 'Marcellus', google: 'Marcellus' },
    uppercase: true,
    colors: {
      primary: '#2A7F9E', primaryDeep: '#1D6079', accent: '#F4B4BC', accentInk: '#4A1F27',
      heroBg: '#E4F4F8', heroInk: '#1F3B47', heroSub: '#2A7F9E', heroMuted: '#3E5763', eyebrow: '#D0607A',
      paper: '#FFFFFF', cream: '#F2FAFC', ink: '#1F3B47', muted: '#4E6772'
    },
    title: 'Stay cool out there',
    subtitle: 'We&rsquo;ll handle the <em>hot market.</em>',
    lead: 'Dreaming of a bigger backyard or a pool of your own? Your house might be worth more than you think.',
    art: { src: 'art/2027-06.jpg', alt: 'House-shaped popsicles on ice by a pool' },
    letter: [
      'Consider this your official permission slip to slow down this summer &mdash; pool days, sprinkler runs, popsicles on the back step (this little sleeve will keep your fingers frost-free).',
      'But here&rsquo;s a fun secret while you&rsquo;re soaking up the sun: the market is hot right now too. Summer buyers are out in full force looking for their next home &mdash; and if you&rsquo;ve been dreaming about a bigger backyard, a pool of your own, or just more room to spread out, your house might be worth more than you think.',
      'So here&rsquo;s the plan: you enjoy the popsicles. We&rsquo;ll keep an eye on the market. And when you&rsquo;re ready to find out what your home is worth &mdash; text us. It takes five minutes, and the number might be sweeter than anything in your freezer.'
    ],
    thanks: 'Stay cool, {name}!'
  },

  '2027-07': {
    theme: 'Ice Cream',
    font: { family: 'Anton', google: 'Anton' },
    uppercase: true,
    colors: {
      primary: '#D46A73', primaryDeep: '#B5525B', accent: '#F4D9B5', accentInk: '#5A3322',
      heroBg: '#FFF1EE', heroInk: '#E07F86', heroSub: '#E07F86', heroMuted: '#6B4A40', eyebrow: '#A0623F',
      paper: '#FFFFFF', cream: '#FFF6F3', ink: '#4A2C22', muted: '#6E5248'
    },
    title: 'We tried to mail you ice cream.',
    subtitle: 'It did <em>not</em> go well.',
    lead: 'Home values around here have been anything but frozen. Find out what yours is worth.',
    art: { src: 'art/2027-07.jpg', alt: 'House made of ice cream with cherries and sprinkles' },
    letter: [
      'So here&rsquo;s what happened: we wanted to send you ice cream. Turns out the Postal Service has opinions about that. So please accept this sticker version &mdash; zero calories, zero melting, 100% less sticky.',
      'And one little scoop while you&rsquo;re out: home values around here have been anything but frozen. If you&rsquo;ve been wondering what yours is worth &mdash; or daydreaming about a kitchen with room for an actual sundae bar &mdash; text us. Five minutes, no melting.',
      'Stay cool out there. &#x1F366;'
    ],
    thanks: 'Here&rsquo;s the scoop, {name}!'
  },

  '2027-08': {
    theme: 'Camp Homeowner',
    font: { family: 'Patrick Hand SC', google: 'Patrick+Hand+SC' },
    uppercase: true,
    colors: {
      primary: '#4E5A2B', primaryDeep: '#39431F', accent: '#D8C27A', accentInk: '#2F3517',
      heroBg: '#F3F1E6', heroInk: '#8C7F45', heroSub: '#5E6630', heroMuted: '#4F5238', eyebrow: '#7A5A35',
      paper: '#FFFFFB', cream: '#F5F3E8', ink: '#2F3517', muted: '#5C5E45'
    },
    title: 'Love the memories, but outgrown the tent?',
    subtitle: 'Let&rsquo;s find your next <em>basecamp.</em>',
    lead: 'You might be surprised at how much equity you&rsquo;ve built up. Get your free estimate.',
    art: { src: 'art/2027-08.jpg', alt: 'Glamping tent by a lake with a For Sale sign' },
    letterEyebrow: 'Ready for your next great adventure?',
    letter: [
      'You&rsquo;ve pitched your tent, made incredible memories, and built something truly special in this home. But if your family is starting to feel a little cramped around the campfire, August is the perfect time to explore what&rsquo;s out there.',
      'Whether you need extra room to roam, a bigger backyard for stargazing, or a fresh new basecamp for the school year ahead, we&rsquo;re here to guide the way. You might be surprised at how much equity you&rsquo;ve built up &mdash; and what it can do for your next move.'
    ],
    thanks: 'Adventure awaits, {name}!'
  },

  '2027-09': {
    theme: 'Report Card',
    font: { family: 'Marcellus', google: 'Marcellus' },
    uppercase: false,
    colors: {
      primary: '#2E2A24', primaryDeep: '#14120F', accent: '#E5B83A', accentInk: '#2E2A24',
      heroBg: '#F5F4F0', heroInk: '#1F1D1A', heroSub: '#2E2A24', heroMuted: '#4D4943', eyebrow: '#A97F12',
      paper: '#FFFFFF', cream: '#F7F6F2', ink: '#2E2A24', muted: '#5E5952'
    },
    title: 'Straight A&rsquo;s&hellip; with one',
    subtitle: 'Note from the <em>teacher.</em>',
    lead: 'Fall is a smart, quieter time to sell. See how your home grades out.',
    art: { src: 'art/2027-09.jpg', alt: 'Your Home&rsquo;s Report Card on a gold clipboard, graded A+' },
    letterEyebrow: 'Home Report Card &middot; Fall Semester',
    letter: [
      '<ul class="lp-grades"><li><span>Memories made</span><b>A+</b></li><li><span>Character &amp; charm</span><b>A</b></li><li><span>Curb appeal</span><b>A</b></li><li><span>Hosting the whole crew</span><b>B+</b></li><li><span>Closet space</span><b>C&minus; <small>(we still love you)</small></b></li><li><span>Room to grow</span><b>See teacher&rsquo;s note</b></li></ul>',
      '<strong>Teacher&rsquo;s note:</strong> This house has done wonderful work &mdash; truly one of our favorites. But the student may be outgrowing the classroom. If your family&rsquo;s heading into a new grade, a new schedule, and a new season&hellip; it might be time to think about a new address too. Fall is a smart, quieter time to sell &mdash; serious buyers, less competition, and you could be settled before the holidays.',
      'Parent-teacher conference available anytime: just text.'
    ],
    thanks: 'Gold star, {name}!'
  },

  '2027-10': {
    theme: 'Haunted House',
    font: { family: 'Marcellus', google: 'Marcellus' },
    uppercase: true,
    colors: {
      primary: '#D9691E', primaryDeep: '#B3531A', accent: '#7E57A8', accentInk: '#FFFFFF',
      heroBg: '#1E1D24', heroInk: '#F3EFE6', heroSub: '#F0A35E', heroMuted: 'rgba(243,239,230,.82)', eyebrow: '#B994DD',
      paper: '#FFFFFF', cream: '#F2F1EF', ink: '#24222B', muted: '#575462'
    },
    title: 'Every house has secrets.',
    subtitle: 'Yours is holding <em>equity.</em>',
    lead: 'No tricks, no pressure. Just what your house is worth.',
    art: { src: 'art/2027-10.jpg', alt: 'Gothic house with a raven and a For Sale sign' },
    letterEyebrow: 'The Haunted House Inspection List',
    letter: [
      '<ul class="lp-checklist"><li>Mysterious cold spots (or just that one drafty window)</li><li>Creaky stairs (we call that &ldquo;character&rdquo;)</li><li>Doors that open on their own (toddler, probably)</li><li>Closets too small to hide a single skeleton</li><li>A garage haunted by everything but the car</li><li>Rooms that shrink a little every year&hellip; spooky. Or your family&rsquo;s just growing.</li></ul>',
      '<strong>Inspector&rsquo;s finding:</strong> &ldquo;This house isn&rsquo;t haunted. It&rsquo;s just outgrown. Recommend viewing larger properties before spirits (yours) decline further.&rdquo;',
      'Curious what your home is worth? That&rsquo;s what the guest check is for &mdash; it never expires, and neither does the offer.',
      '<div class="lp-check"><p class="lp-check__title">Guest Check</p><ul><li><span>1&times; Free Home Valuation</span><b>$0.00</b></li><li><span>Tricks</span><b>none</b></li><li><span>Pressure</span><b>none</b></li><li><span>Knowing what your house is worth</span><b>priceless</b></li></ul><p class="lp-check__total"><span>Total due:</span> one text message</p><p class="lp-check__fine">Redeemable anytime. This check never expires &mdash; unlike this market&rsquo;s inventory.</p></div>'
    ],
    thanks: 'Treat incoming, {name}!'
  },

  '2027-11': {
    theme: 'Thanksgiving',
    font: { family: 'Marcellus', google: 'Marcellus' },
    uppercase: true,
    colors: {
      primary: '#8A4A25', primaryDeep: '#6B381B', accent: '#E2A35A', accentInk: '#3D1F0E',
      heroBg: '#FBF6EF', heroInk: '#8A4A25', heroSub: '#A55E2E', heroMuted: '#5E4636', eyebrow: '#A55E2E',
      paper: '#FFFFFF', cream: '#FBF7F1', ink: '#3D2A1E', muted: '#6A5546'
    },
    title: 'This year, we&rsquo;re not wishing for anything.',
    subtitle: 'We&rsquo;ve got <em>you.</em>',
    lead: 'Thank you for a wonderful year. Whenever you&rsquo;re curious what your home is worth, the offer&rsquo;s always open.',
    art: { src: 'art/2027-11.jpg', alt: 'Thanksgiving table with turkey, sides and a wishbone' },
    greeting: 'Hello November',
    letter: [
      'No market talk this month. No home values, no &ldquo;just checking in.&rdquo; Just this:',
      'We get to do what we love because people like you trust us, wave at us, refer us, and open our slightly ridiculous mail all year long. That&rsquo;s not lost on us &mdash; not for one day.',
      'So here&rsquo;s your very own wishbone &mdash; no elbows at the table required. We hope your November is full: full table, full house, full hearts.',
      'Happy Thanksgiving, from our family to yours.'
    ],
    thanks: 'Thank you, {name}!'
  },

  '2027-12': {
    theme: 'Home for the Holidays',
    font: { family: 'Lilita One', google: 'Lilita+One' },
    uppercase: true,
    colors: {
      primary: '#B5121B', primaryDeep: '#8E0E15', accent: '#C9A24A', accentInk: '#3A0A0C',
      heroBg: '#F1EFEC', heroInk: '#B5121B', heroSub: '#B5121B', heroMuted: '#4A3B3B', eyebrow: '#1F6B3A',
      paper: '#FFFFFF', cream: '#F7F4F0', ink: '#3A1E1F', muted: '#665052'
    },
    title: 'Home for the holidays',
    subtitle: 'However you <em>shake it!</em>',
    lead: 'Ready to find a place worth coming home to? Start with what your home is worth.',
    art: { src: 'art/2027-12.jpg', alt: 'Snow globe with a decorated house and a For Sale sign' },
    greeting: 'Merry Christmas to my favorite client',
    letter: [
      'These tags are for your wrapping pile.',
      'And as you&rsquo;re wrapping up the year, we just want to say: thank you for opening our mail, laughing at our jokes, and letting us be a small part of your year. Whether 2028 brings you a bigger kitchen, a new address, or just more good nights in the home you love &mdash; we&rsquo;re wishing you all of it.',
      'Merry everything, from our family to yours.'
    ],
    closing: 'Ready to find a place worth coming home to?',
    thanks: 'Merry &amp; bright, {name}!'
  }
};
