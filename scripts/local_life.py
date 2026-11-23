"""Local-life facts for the new-construction area pages.

Every place below was on an official builder, city, park, tourism, or
store page when these notes were checked in November 2026. If a festival
date moved, the card says so.
"""

import html

def esc(value):
    return html.escape(str(value), quote=True)


def _cards(items):
    blocks = []
    for item in items:
        blocks.append(
            f'<a href="{esc(item["url"])}" target="_blank" rel="noopener noreferrer" '
            f'class="block rounded-2xl border border-momentum-grayLight bg-white p-4 shadow-sm hover:border-teal-600">'
            f'<span class="text-xs font-bold uppercase tracking-wider text-teal-700">{esc(item["kicker"])}</span>'
            f'<span class="mt-1 block font-serif text-lg font-semibold text-momentum-blue">{esc(item["name"])}</span>'
            f'<span class="mt-1 block text-sm leading-relaxed text-slate-600">{esc(item["text"])}</span>'
            f'</a>'
        )
    return "".join(blocks)


def _group(title, intro, items):
    return (
        f'<h3 class="mt-8 font-serif text-2xl font-semibold text-momentum-blue">{title}</h3>'
        f'<p class="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{intro}</p>'
        f'<div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{_cards(items)}</div>'
    )


LIFE = {
    "yulee-fl": {
        "intro": "Yulee's daily life splits between the master plans and Fernandina Beach, one exit east. The list below is what those places published in 2026, not a complete phone book.",
        "groups": [
            ("Events", "Annual dates first, then the weekly rhythm inside Wildlight.", [
                {"kicker": "May", "name": "Isle of Eight Flags Shrimp Festival", "text": "Downtown Fernandina Beach. The festival site lists May 1 to 3, 2026. The city permit calendar also lists the Red, White and Shrimp Parade on April 30.", "url": "https://www.shrimpfestival.com/directions/"},
                {"kicker": "City calendar", "name": "Fernandina Beach permitted events", "text": "The city posts permitted special events, including the Shrimp Festival, the Shrimp Run, and the Kingfish Tournament. The city is not the organizer.", "url": "https://fl-fernandinabeach2.civicplus.com/1122/Upcoming-Events"},
                {"kicker": "Twice a month", "name": "Wildlight Marketplace", "text": "Wildlight's calendar lists an outdoor market on the first and third Saturday, 9 a.m. to 1 p.m., on Tinker Street.", "url": "https://wildlight.com/whats-happening/events/"},
                {"kicker": "Annual", "name": "Run Wild 5K and 10K", "text": "Wildlight's FAQ names this as one of the community's own annual events, along with family activities and farmers markets.", "url": "https://wildlight.com/faq/"},
            ]),
            ("Shopping", "Groceries in Yulee, and the walkable shops on the island.", [
                {"kicker": "In Wildlight", "name": "Publix at the Village Center", "text": "Wildlight says a Publix, the YMCA, and UF Health sit in the Town District with the Village Center shops.", "url": "https://wildlight.com/town-district/town-district-life/"},
                {"kicker": "Yulee", "name": "Target", "text": "Target's own store page lists 463737 State Road 200, Yulee, and shows hours for late November 2026.", "url": "https://www.target.com/sl/yulee/2155"},
                {"kicker": "Yulee", "name": "Walmart Supercenter", "text": "Walmart store 5037 lists 464016 State Road 200, Yulee, and shows the supercenter as open.", "url": "https://www.walmart.com/store/5037-yulee-fl"},
                {"kicker": "Fernandina", "name": "Centre Street shops", "text": "Amelia Island's visitor bureau points downtown Fernandina, including Centre Street, for independent shops and restaurants.", "url": "https://www.ameliaisland.com/restaurants-bars/"},
            ]),
            ("Restaurants", "A mix of Yulee and Fernandina, from the visitor bureau's 2026 pages.", [
                {"kicker": "Mexican", "name": "Pepper's Cocina", "text": "The visitor bureau lists it at 530 Centre Street, lunch and dinner, in the $$ range, and shows it open seven days.", "url": "https://www.ameliaisland.com/partners/peppers-cocina-mexicana-tequila-bar/"},
                {"kicker": "Burgers", "name": "T-Ray's Burger Station", "text": "A September 2026 visitor-bureau story puts this former service station at 202 S 8th Street for breakfast and burgers.", "url": "https://www.ameliaisland.com/blog/top-places-to-eat-on-a-budget/"},
                {"kicker": "Cuban", "name": "Hola Cuban Cafe", "text": "The same 2026 story lists Cuban sandwiches and coffee at 31 S 5th Street, breakfast and lunch.", "url": "https://www.ameliaisland.com/blog/top-places-to-eat-on-a-budget/"},
                {"kicker": "Seafood and steak", "name": "The Boat House", "text": "The visitor bureau's dining directory describes a downtown seafood and steak restaurant built around shareable plates.", "url": "https://www.ameliaisland.com/restaurants-bars/"},
                {"kicker": "Historic bar", "name": "The Palace Saloon", "text": "The directory calls it Florida's oldest saloon, on Centre Street, with live music.", "url": "https://www.ameliaisland.com/restaurants-bars/"},
                {"kicker": "Cafe", "name": "Cafe Karibo", "text": "Listed in the dining directory as an affordable cafe with a patio, in the $$ range.", "url": "https://www.ameliaisland.com/restaurants-bars/"},
                {"kicker": "Yulee", "name": "Bohemian Bull", "text": "A July 2026 visitor-bureau story on Nassau County lists burgers and craft beer in Yulee.", "url": "https://www.ameliaisland.com/blog/beyond-the-beach-discover-nassau-county/"},
                {"kicker": "Italian", "name": "Olive Cove Italian Kitchen", "text": "Named in that same July 2026 Nassau County story as a Yulee Italian kitchen.", "url": "https://www.ameliaisland.com/blog/beyond-the-beach-discover-nassau-county/"},
                {"kicker": "Mexican", "name": "Don Patron Grill and Cantina", "text": "Also in the July 2026 Nassau County story, for Mexican food in Yulee rather than on the island.", "url": "https://www.ameliaisland.com/blog/beyond-the-beach-discover-nassau-county/"},
            ]),
            ("Outdoors and family", "State parks on the island, and the trail network inside Wildlight.", [
                {"kicker": "State park", "name": "Fort Clinch State Park", "text": "The state park at the north end of Amelia Island. Civil War fort, beach, and a campground.", "url": "https://www.floridastateparks.org/parks-and-trails/fort-clinch-state-park"},
                {"kicker": "State park", "name": "Amelia Island State Park", "text": "The state park at the south end of the island, known for beach driving in a designated area and horseback rides.", "url": "https://www.floridastateparks.org/parks-and-trails/amelia-island-state-park"},
                {"kicker": "In the community", "name": "Wildlight parks and the Y", "text": "Wildlight describes four neighborhood parks, pools, courts, a trail network, and a YMCA in the Town District.", "url": "https://wildlight.com/town-district/town-district-life/"},
                {"kicker": "In the community", "name": "Tributary Lookout", "text": "Tributary publishes a pool, fitness studio, pickleball, dog park, and paths, with a kayak launch planned at Boggy Creek.", "url": "https://tributaryliving.com/community/community-faqs/"},
            ]),
        ],
    },
    "st-johns-county-fl": {
        "intro": "Nocatee publishes its own town center and event calendar. St. Augustine, a short drive south, is the county's festival city.",
        "groups": [
            ("Events", "One is inside Nocatee. One takes over downtown St. Augustine all winter.", [
                {"kicker": "Every other Friday", "name": "Nocatee Food Truck Friday", "text": "Visit St. Augustine lists it at Nocatee Station Field, 5:30 to 8:30 p.m., with local musicians. Weather cancels it.", "url": "https://www.visitstaugustine.com/restaurant/nocatee-food-truck-friday"},
                {"kicker": "Community calendar", "name": "Nocatee events", "text": "Nocatee's own events page is the place for that month's resident activities. The welcome center is 245 Nocatee Center Way.", "url": "https://www.nocatee.com/events"},
                {"kicker": "November to January", "name": "Nights of Lights", "text": "Visit St. Augustine lists the 2026 to 2027 display from November 21, 2026 through January 18, 2027, downtown.", "url": "https://www.visitstaugustine.com/events/nights-lights"},
            ]),
            ("Shopping and town center", "Nocatee's directory is the current open-business list. Skip anything the directory marks as a future opening.", [
                {"kicker": "Grocery", "name": "Publix, East Town Center", "text": "Nocatee's business directory lists Publix at 250 Pine Lake Drive in the Town Center.", "url": "https://info.nocatee.com/town-center-directory"},
                {"kicker": "Town center", "name": "Nocatee Town Center directory", "text": "Visit St. Augustine describes more than 120 stores and services you can reach on foot, by bike, or by car. The directory is the live list.", "url": "https://www.visitstaugustine.com/community/nocatee"},
            ]),
            ("Restaurants", "These are open listings on Nocatee's Town Center directory, not the spaces marked for 2027 or 2028.", [
                {"kicker": "Mexican", "name": "Anejo Cocina", "text": "335 Pine Lake Drive, in the Town Center directory.", "url": "https://info.nocatee.com/town-center-directory"},
                {"kicker": "Steak", "name": "Chop House at Nocatee", "text": "330 Pine Lake Drive, in the same directory.", "url": "https://info.nocatee.com/town-center-directory"},
                {"kicker": "Sushi", "name": "Tanks Sushi", "text": "151 Pine Lake Drive, listed as open in the Town Center.", "url": "https://info.nocatee.com/town-center-directory"},
                {"kicker": "Seafood", "name": "Timoti's Seafood Shak", "text": "152 Capital Green Drive, in the Town Center directory.", "url": "https://info.nocatee.com/town-center-directory"},
                {"kicker": "Pizza", "name": "The Loop Pizza Grill", "text": "101 Marketside Avenue, in the Town Center directory.", "url": "https://info.nocatee.com/town-center-directory"},
                {"kicker": "American", "name": "Treylor Park", "text": "58 Marketside Avenue, in the Town Center directory.", "url": "https://info.nocatee.com/town-center-directory"},
                {"kicker": "Italian", "name": "Riviera 89", "text": "100 Marketside Avenue, in the Town Center directory.", "url": "https://info.nocatee.com/town-center-directory"},
                {"kicker": "Cafe", "name": "Panera Bread", "text": "35 Capital Green Drive, in the Town Center directory.", "url": "https://info.nocatee.com/town-center-directory"},
                {"kicker": "Southern", "name": "South Kitchen", "text": "150 Pine Lake Drive, in the Town Center directory.", "url": "https://info.nocatee.com/town-center-directory"},
            ]),
            ("Outdoors and family", "Nocatee's own amenity description, plus the beach state park south of the county.", [
                {"kicker": "In Nocatee", "name": "Trails, parks, and the water park", "text": "Visit St. Augustine describes miles of fitness trails, a community center, and a water park with a four-story spray playground.", "url": "https://www.visitstaugustine.com/community/nocatee"},
                {"kicker": "State park", "name": "Anastasia State Park", "text": "The state park on Anastasia Island, with beach, a lagoon, and camping, south of St. Augustine.", "url": "https://www.floridastateparks.org/parks-and-trails/anastasia-state-park"},
            ]),
        ],
    },
    "clay-county-fl": {
        "intro": "Orange Park and Fleming Island are the everyday side of this page. Green Cove Springs and Middleburg are where the newer houses are. Wilford Oaks buyers will use Oakleaf Town Center more than downtown Green Cove.",
        "groups": [
            ("Shopping", "Named by the builder or by the county, not by a brochure we cannot source.", [
                {"kicker": "Near Wilford Oaks", "name": "Oakleaf Town Center", "text": "Dream Finders says Wilford Oaks is minutes from Oakleaf Town Center for shops, restaurants, and entertainment.", "url": "https://dreamfindershomes.com/new-homes/fl/orange-park/wilford-oaks/"},
                {"kicker": "County park", "name": "Doctors Lake Park", "text": "Clay County lists this Fleming Island park, with a fishing pier, at 2399 Lakeshore Drive North.", "url": "https://www.claycountygov.com/Home/Components/FacilityDirectory/FacilityDirectory/148/1021"},
            ]),
            ("Restaurants and the water", "Whitey's publishes its own hours. The Oakleaf and marina spots are from a Clay guide dated October 22, 2026.", [
                {"kicker": "Seafood", "name": "Whitey's Fish Camp", "text": "On Doctors Lake since 1963. The restaurant site lists 2032 County Road 220, Fleming Island, and current hours, including a Monday dinner-only open.", "url": "https://whiteysfishcamp.com/"},
                {"kicker": "Breakfast", "name": "Keke's Breakfast Cafe", "text": "A Clay guide dated October 22, 2026 places this breakfast and lunch spot at 9570 Crosshill Boulevard in Oakleaf Town Center.", "url": "https://whatsgoodclay.com/a/things-to-do-in-orange-park-fl"},
                {"kicker": "Japanese", "name": "Osaka Japanese Steak House", "text": "The same October 2026 Clay guide lists hibachi at Oakleaf Town Center.", "url": "https://whatsgoodclay.com/a/things-to-do-in-orange-park-fl"},
                {"kicker": "On the water", "name": "Sunset Tiki Bar", "text": "The guide places it at Doctors Lake Marina, 3108 U.S. 17, Fleming Island, between the docks.", "url": "https://whatsgoodclay.com/a/things-to-do-in-orange-park-fl"},
                {"kicker": "Park", "name": "Doctors Lake Park pier", "text": "The county facility page is the right link for hours and the pier. Paddle craft rentals operate from the same park.", "url": "https://www.claycountygov.com/Home/Components/FacilityDirectory/FacilityDirectory/148/1021"},
                {"kicker": "Trail", "name": "Black Creek Park and Trail", "text": "The October 2026 guide describes an 8-mile paved path from Black Creek Park at 7890 U.S. 17 in Fleming Island.", "url": "https://whatsgoodclay.com/a/things-to-do-in-orange-park-fl"},
                {"kicker": "Town park", "name": "Clarke House Park", "text": "The same guide describes playgrounds, trails, gardens, and a lake at 1039 Kingsley Avenue in Orange Park.", "url": "https://whatsgoodclay.com/a/things-to-do-in-orange-park-fl"},
            ]),
            ("Inside the new communities", "What the developers say is on site, separate from the town.", [
                {"kicker": "Wilford Oaks", "name": "Pool, clubhouse, and dog park", "text": "Dream Finders describes these as open amenities, along with a fitness center and playground.", "url": "https://dreamfindershomes.com/new-homes/fl/orange-park/wilford-oaks/"},
                {"kicker": "Hyland Trail", "name": "Pool, trails, and pickleball", "text": "GreenPointe describes trails, pocket parks, a pool and splash zone, fitness, pickleball, a play park, and a dog park, next to Ronnie Van Zant Memorial Park.", "url": "https://greenpointellc.com/communities/hyland-trail/"},
            ]),
        ],
    },
    "jacksonville-northside-fl": {
        "intro": "The new houses are near the airport and River City Marketplace. The water and the shrimp shacks are east, at Mayport. Those are two different Saturday plans.",
        "groups": [
            ("Shopping", "The center the builders actually name.", [
                {"kicker": "Northside", "name": "River City Marketplace", "text": "D.R. Horton describes The Arbors as a few miles from River City Marketplace, the Northside shopping and dining center.", "url": "https://www.drhorton.com/florida/jacksonville-area/jacksonville/the-arbors"},
            ]),
            ("Restaurants", "Mayport and the Intracoastal, from Visit Jacksonville's 2026 dining pages. The new-home streets themselves are farther west.", [
                {"kicker": "Seafood", "name": "Singleton's Seafood Shack", "text": "On A1A in Mayport. The visitor bureau highlights Mayport shrimp, Minorcan chowder, and a fish-camp setting.", "url": "https://www.visitjacksonville.com/blog/a-feast-for-your-eyes-restaurants-with-the-best-views-in-jacksonville/"},
                {"kicker": "Seafood market", "name": "Safe Harbor Seafood", "text": "Visit Jacksonville describes a market and restaurant on the dock in Mayport Village.", "url": "https://www.visitjacksonville.com/blog/eat-drink-at-the-beaches/"},
                {"kicker": "Intracoastal", "name": "Dockside Seafood", "text": "On the Intracoastal, listed for Mayport shrimp. A drive east from the 32218 and 32219 communities.", "url": "https://www.visitjacksonville.com/things-to-do/beaches-water/jacksonville-beach/"},
                {"kicker": "Upscale", "name": "Marker 32", "text": "Coastal dining on the Intracoastal, on the visitor bureau's beaches dining list.", "url": "https://www.visitjacksonville.com/blog/eat-drink-at-the-beaches/"},
                {"kicker": "Tacos", "name": "TacoLu", "text": "Jacksonville Beach, on the August 2026 best-bites list. Worth the drive if you are already headed toward Mayport.", "url": "https://www.visitjacksonville.com/blog/jacksonville-best-bites/"},
                {"kicker": "Subs", "name": "Angie's Subs", "text": "A Jacksonville Beach staple on the visitor bureau's beaches page.", "url": "https://www.visitjacksonville.com/things-to-do/beaches-water/jacksonville-beach/"},
            ]),
            ("Outdoors", "The city park between the Northside and the Mayport basin.", [
                {"kicker": "City park", "name": "Kathryn Abbey Hanna Park", "text": "500 Wonderwood Drive. Beach, a freshwater lake, more than 20 miles of bike trails, and camping. The city posts entry fees and a military discount.", "url": "https://www.jacksonville.gov/departments/parks-and-recreation/jaxparks/oceanfront-parks/kathryn-abbey-hanna-park"},
                {"kicker": "On the river", "name": "Riverview Park and the Trout River", "text": "D.R. Horton points Trout River buyers to Riverview Park for kayaking and walks, with I-295 as the commute road.", "url": "https://www.drhorton.com/florida/jacksonville-area/jacksonville/trout-river"},
            ]),
        ],
    },
    "jacksonville-beaches-fl": {
        "intro": "Jacksonville Beach is where North Beach Townhomes sits. Atlantic Beach and Neptune Beach are the resale towns next door. One long-running festival has ended. The holiday one has not.",
        "groups": [
            ("Events", "Use the current dates. Do not plan a trip around a festival that has retired.", [
                {"kicker": "November to January", "name": "Deck the Chairs", "text": "Seawalk Pavilion and Latham Plaza. The organizers list November 25, 2026 through January 1, 2027, free, with nightly lights.", "url": "https://www.deckthechairs.org/jacksonville"},
                {"kicker": "Retired", "name": "Springing the Blues", "text": "The festival's own site says the board retired it after the April 2026 edition. It is not on the calendar going forward.", "url": "https://www.springingtheblues.com/"},
                {"kicker": "Weekends", "name": "Seawalk Pavilion", "text": "Dream Finders says the pavilion, minutes from North Beach Townhomes, hosts festivals, live music, and a weekly farmers market.", "url": "https://dreamfindershomes.com/new-homes/fl/jacksonville-beach/north-beach-townhomes/"},
            ]),
            ("Restaurants", "Visit Jacksonville's beaches guide and its August 2026 best-bites list.", [
                {"kicker": "Subs", "name": "Angie's Subs", "text": "A Jacksonville Beach staple on the visitor bureau's beaches page, known for the Peruvian sub.", "url": "https://www.visitjacksonville.com/things-to-do/beaches-water/jacksonville-beach/"},
                {"kicker": "Tacos", "name": "TacoLu", "text": "Named on both the beaches page and the August 2026 best-bites list for shrimp tacos.", "url": "https://www.visitjacksonville.com/blog/jacksonville-best-bites/"},
                {"kicker": "Seafood", "name": "Dockside Seafood", "text": "On the Intracoastal, called out for Mayport shrimp. Family-casual.", "url": "https://www.visitjacksonville.com/things-to-do/beaches-water/jacksonville-beach/"},
                {"kicker": "Upscale", "name": "Marker 32", "text": "Coastal dining on the Intracoastal. The visitor bureau describes oysters, scallops, and shrimp.", "url": "https://www.visitjacksonville.com/blog/eat-drink-at-the-beaches/"},
                {"kicker": "German", "name": "Hoptinger Bier Garden", "text": "On the official Jacksonville Beach visitor page for German food and craft beer.", "url": "https://www.visitjacksonville.com/things-to-do/beaches-water/jacksonville-beach/"},
                {"kicker": "Brunch", "name": "Jax Beach Brunch Haus", "text": "All-day brunch, on the same Jacksonville Beach visitor page.", "url": "https://www.visitjacksonville.com/things-to-do/beaches-water/jacksonville-beach/"},
                {"kicker": "Filipino", "name": "Abstrakt Filipino Essence", "text": "Listed on the Jacksonville Beach visitor page for Filipino cooking.", "url": "https://www.visitjacksonville.com/things-to-do/beaches-water/jacksonville-beach/"},
                {"kicker": "Hotel dining", "name": "Casa Marina", "text": "Rooftop at the historic beach hotel, including a Sunday brunch, on the visitor bureau's view-dining list.", "url": "https://www.visitjacksonville.com/blog/a-feast-for-your-eyes-restaurants-with-the-best-views-in-jacksonville/"},
                {"kicker": "Neptune Beach", "name": "North Beach Fish Camp", "text": "In Beaches Town Center. The August 2026 list describes blackened fish, grits, and collards.", "url": "https://www.visitjacksonville.com/blog/jacksonville-best-bites/"},
            ]),
            ("Parks and the sand", "City parks, plus the park Dream Finders says is next to the townhomes.", [
                {"kicker": "Next door", "name": "Gonzales Park", "text": "Dream Finders says North Beach Townhomes is adjacent to Gonzales Park and 10 blocks from the beach.", "url": "https://dreamfindershomes.com/new-homes/fl/jacksonville-beach/north-beach-townhomes/"},
                {"kicker": "City park", "name": "Kathryn Abbey Hanna Park", "text": "Oceanfront city park at 500 Wonderwood Drive, with a beach, lake, trails, and camping. Military discount posted by the city.", "url": "https://www.jacksonville.gov/departments/parks-and-recreation/jaxparks/oceanfront-parks/kathryn-abbey-hanna-park"},
                {"kicker": "Pier", "name": "Jacksonville Beach", "text": "The visitor bureau's Jacksonville Beach page covers the pier, the boardwalk, and the oceanfront dining around it.", "url": "https://www.visitjacksonville.com/things-to-do/beaches-water/jacksonville-beach/"},
            ]),
        ],
    },
    "jacksonville-westside-fl": {
        "intro": "The Westside new-home search sits between NAS Jacksonville and the Clay County line. A lot of the shopping and the fish camp are just over that line, which is why the Clay page is the companion.",
        "groups": [
            ("Shopping and outdoors", "What the builders and the daily paper place around these communities.", [
                {"kicker": "Nearby", "name": "Oakleaf Town Center", "text": "The retail center Dream Finders names for this side of town. It serves both the Westside and Orange Park.", "url": "https://dreamfindershomes.com/new-homes/fl/jacksonville/diamond-springs/"},
                {"kicker": "Planned", "name": "Diamond Springs lagoon", "text": "The Jacksonville Daily Record reported the October 28, 2026 groundbreaking. Kayaking and the splash pad are the plan, not a finished Saturday.", "url": "https://www.jaxdailyrecord.com/news/2026/oct/27/lagoon-community-in-west-jacksonville-sets-groundbreaking-for-signature-feature/"},
                {"kicker": "Base", "name": "NAS Jacksonville", "text": "SEDA puts Weston Woods 12 miles from the air station. The installation guide covers the gate, the hospital, and housing.", "url": "https://buyjacksonvillefl.com/bases/nas-jacksonville.html"},
            ]),
            ("Restaurants", "These sit just across the Clay line, which is the practical dinner list for a Westside address. Details are on each site or in the October 22, 2026 Clay guide.", [
                {"kicker": "Seafood", "name": "Whitey's Fish Camp", "text": "2032 County Road 220, Fleming Island, on Doctors Lake. Current hours are on the restaurant's site.", "url": "https://whiteysfishcamp.com/"},
                {"kicker": "Breakfast", "name": "Keke's Breakfast Cafe", "text": "9570 Crosshill Boulevard at Oakleaf Town Center, from the October 22, 2026 Clay guide.", "url": "https://whatsgoodclay.com/a/things-to-do-in-orange-park-fl"},
                {"kicker": "Japanese", "name": "Osaka Japanese Steak House", "text": "Hibachi at Oakleaf Town Center, from the same guide.", "url": "https://whatsgoodclay.com/a/things-to-do-in-orange-park-fl"},
                {"kicker": "On the water", "name": "Sunset Tiki Bar", "text": "Doctors Lake Marina, 3108 U.S. 17, Fleming Island.", "url": "https://whatsgoodclay.com/a/things-to-do-in-orange-park-fl"},
                {"kicker": "Park", "name": "Doctors Lake Park", "text": "County park and fishing pier at 2399 Lakeshore Drive North, Fleming Island.", "url": "https://www.claycountygov.com/Home/Components/FacilityDirectory/FacilityDirectory/148/1021"},
                {"kicker": "Trail", "name": "Black Creek Trail", "text": "The October 2026 guide describes the paved path from Black Creek Park at 7890 U.S. 17.", "url": "https://whatsgoodclay.com/a/things-to-do-in-orange-park-fl"},
            ]),
        ],
    },
    "kingsland-st-marys-ga": {
        "intro": "Two festivals anchor the year. One of them was postponed in 2026. Cumberland Island is the day trip, and the ferry sells out.",
        "groups": [
            ("Events", "Check the date before you promise a guest the parade.", [
                {"kicker": "First Saturday in October", "name": "St. Marys Seafood Festival", "text": "Visit St. Marys lists October 3, 2026, on the waterfront, with a 5K, a 10 a.m. parade, and music until evening. It used to be called the Rock Shrimp Festival.", "url": "https://visitstmarys.com/st-marys-seafood-fest-1"},
                {"kicker": "Usually November", "name": "Kingsland Catfish Festival", "text": "The festival site lists a Friday and Saturday in November in downtown Kingsland. Visit Kingsland's calendar marked the 2026 dates postponed for weather, with a new date not yet posted.", "url": "https://kingslandcatfishfestival.org/festival-info/"},
            ]),
            ("Outdoors", "The national seashore is a ferry ride, not a drive.", [
                {"kicker": "National park", "name": "Cumberland Island", "text": "National Park Service hours and the ferry schedule. The ride is about 45 minutes from downtown St. Marys. Reservations go through the ferry.", "url": "https://www.nps.gov/cuis/planyourvisit/hours.htm"},
                {"kicker": "Ferry", "name": "Cumberland Island Ferry", "text": "Departs St. Marys. The ferry site posts fares and the seasonal timetable, and notes that trips sell out.", "url": "https://www.cumberlandislandferry.com/st-marys-cumberland-island-ferry/"},
                {"kicker": "Waterfront", "name": "St. Marys historic district", "text": "The Seafood Festival and the ferry both use the waterfront. Visit Kingsland describes the district as the walkable end of the day.", "url": "https://visitkingsland.com/annual-events/seafood-festival/"},
            ]),
            ("Restaurants", "Visit Kingsland's dining guide. These are independent rooms, not the chain row on Highway 40.", [
                {"kicker": "Italian", "name": "Angelo's", "text": "1371 GA-40 E, Kingsland, on the visitor dining guide.", "url": "https://visitkingsland.com/eat/"},
                {"kicker": "Kingsland", "name": "Steffens Restaurant", "text": "550 S Lee Street, Kingsland, on the same guide.", "url": "https://visitkingsland.com/eat/"},
                {"kicker": "Kingsland", "name": "Karv Bistro", "text": "100 Marsh Harbour Parkway, Kingsland, on the visitor dining guide.", "url": "https://visitkingsland.com/eat/"},
                {"kicker": "St. Marys", "name": "Seagle's", "text": "105 Osborne Street in the historic district. The guide also lists Captain Seagle's saloon at the same address.", "url": "https://visitkingsland.com/eat/"},
                {"kicker": "Dockside", "name": "Locals Dockside", "text": "307 St. Marys Street W, on the visitor dining guide.", "url": "https://visitkingsland.com/eat/"},
                {"kicker": "Thai", "name": "Drunken Noodle", "text": "888 Kings Bay Road, St. Marys, on the visitor dining guide.", "url": "https://visitkingsland.com/eat/"},
                {"kicker": "Mexican", "name": "Mi Casa", "text": "745 Kings Bay Road, St. Marys, on the visitor dining guide.", "url": "https://visitkingsland.com/eat/"},
                {"kicker": "Deli", "name": "Green Room Sicilian Cafe", "text": "2826 St. Marys Road, on the visitor dining guide.", "url": "https://visitkingsland.com/eat/"},
            ]),
        ],
    },
}


def life_section(slug):
    life = LIFE.get(slug)
    if not life:
        return ""
    groups = "".join(_group(title, intro, items) for title, intro, items in life["groups"])
    return f"""
    <section id="local-life" class="scroll-mt-28 border-t border-momentum-grayLight bg-momentum-bgLight py-14">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p class="text-xs font-bold uppercase tracking-widest text-teal-700">Local life</p>
        <h2 class="mt-2 font-serif text-3xl font-semibold text-momentum-blue">What a week here actually looks like</h2>
        <p class="mt-3 max-w-3xl text-base leading-relaxed text-slate-700">{life["intro"]}</p>
        {groups}
      </div>
    </section>
"""


def life_sources(slug):
    life = LIFE.get(slug)
    if not life:
        return []
    seen = set()
    sources = []
    for _title, _intro, items in life["groups"]:
        for item in items:
            if item["url"] in seen:
                continue
            seen.add(item["url"])
            sources.append({"label": item["name"], "url": item["url"]})
    return sources
