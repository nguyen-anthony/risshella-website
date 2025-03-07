export interface Career {
 career_id: string;
 career_name: string;
}

export interface Pack {
 pack_id: string;
 pack_name: string;
 careers: Career[];
}

export const PACKS: Pack[] = [
 {
  pack_id: "1",
  pack_name: "Base Game",
  careers: [
   { career_name: "Astronaut", career_id: "1" },
   { career_name: "Athlete", career_id: "2" },
   { career_name: "Business", career_id: "3" },
   { career_name: "Criminal", career_id: "4" },
   { career_name: "Culinary", career_id: "5" },
   { career_name: "Entertainer", career_id: "6" },
   { career_name: "Freelancer", career_id: "7" },
   { career_name: "Painter", career_id: "8" },
   { career_name: "Secret Agent", career_id: "9" },
   { career_name: "Style Influencer", career_id: "10" },
   { career_name: "Tech Guru", career_id: "11" },
   { career_name: "Writer", career_id: "12" }
  ]
 },
 {
  pack_id: "2",
  pack_name: "Get to Work",
  careers: [
   { career_name: "Detective", career_id: "13" },
   { career_name: "Doctor", career_id: "14" },
   { career_name: "Scientist", career_id: "15" }
  ]
 },
 {
  pack_id: "3",
  pack_name: "City Living",
  careers: [
   { career_name: "Critic", career_id: "16" },
   { career_name: "Politician", career_id: "17" },
   { career_name: "Social Media", career_id: "18" }
  ]
 },
 {
  pack_id: "4",
  pack_name: "Seasons",
  careers: [
   { career_name: "Gardener", career_id: "19" }
  ]
 },
 {
  pack_id: "5",
  pack_name: "Get Famous",
  careers: [
   { career_name: "Actor", career_id: "20" }
  ]
 },
 {
  pack_id: "6",
  pack_name: "Strangerville",
  careers: [
   { career_name: "Military", career_id: "21" }
  ]
 },
 {
  pack_id: "7",
  pack_name: "Island Living",
  careers: [
   { career_name: "Conservationist", career_id: "22" }
  ]
 },
 {
  pack_id: "8",
  pack_name: "Discover University",
  careers: [
   { career_name: "Education", career_id: "23" },
   { career_name: "Engineer", career_id: "24" },
   { career_name: "Law", career_id: "25" }
  ]
 },
 {
  pack_id: "9",
  pack_name: "Eco Lifestyle",
  careers: [
   { career_name: "Civil Designer", career_id: "26" }
  ]
 },
 {
  pack_id: "10",
  pack_name: "Snowy Escape",
  careers: [
   { career_name: "Salaryperson", career_id: "27" }
  ]
 },
 {
  pack_id: "11",
  pack_name: "Dream Home Decorator",
  careers: [
   { career_name: "Interior Decorator", career_id: "28" }
  ]
 },
 {
  pack_id: "12",
  pack_name: "Lovestruck",
  careers: [
   { career_name: "Romance Consultant", career_id: "29" }
  ]
 },
 {
  pack_id: "13",
  pack_name: "Life & Death",
  careers: [
   { career_name: "Reaper", career_id: "30" },
   { career_name: "Undertaker", career_id: "31" }
  ]
 }
]