import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp } from "lucide-react"

export function Sidebar() {
  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/diverse-profile-avatars.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-heading">John Doe</CardTitle>
              <p className="text-sm text-muted-foreground">@johndoe</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-between text-sm">
            <div className="text-center">
              <div className="font-semibold">1.2K</div>
              <div className="text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">3.4K</div>
              <div className="text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">156</div>
              <div className="text-muted-foreground">Posts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["#WebDevelopment", "#React", "#SpringBoot", "#Kubernetes"].map((tag) => (
            <div key={tag} className="flex items-center justify-between">
              <span className="text-sm font-medium text-accent hover:underline cursor-pointer">{tag}</span>
              <span className="text-xs text-muted-foreground">2.1K posts</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Suggested Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Users className="h-4 w-4" />
            Suggested for you
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: "Sarah Wilson", handle: "@sarahw", avatar: "developer+avatar" },
            { name: "Mike Chen", handle: "@mikec", avatar: "engineer+avatar" },
          ].map((user) => (
            <div key={user.handle} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/abstract-geometric-shapes.png?height=32&width=32&query=${user.avatar}`} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.handle}</div>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Follow
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
