defmodule BackendWeb.Router do
  use BackendWeb, :router

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_live_flash)
    plug(:put_root_layout, html: {BackendWeb.Layouts, :root})
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
  end

  pipeline :api do
    plug(:accepts, ["json"])
  end

  scope "/", BackendWeb do
    pipe_through(:browser)

    get("/", PageController, :home)

    live_session :dashboard do
      live("/dashboard", DashboardLive.Index, :index)
      live("/dashboard/tasks", TaskLive.Index, :index)
      live("/dashboard/tasks/:id", TaskLive.Show, :show)
      live("/dashboard/agents", AgentLive.Index, :index)
      live("/dashboard/agents/:id", AgentLive.Show, :show)
      live("/dashboard/convoys", ConvoyLive.Index, :index)
      live("/dashboard/convoys/:id", ConvoyLive.Show, :show)
      live("/dashboard/messages", MessageLive.Index, :index)
    end
  end

  scope "/api", BackendWeb do
    pipe_through(:api)

    get("/health", HealthController, :index)
    get("/status", StatusController, :index)

    get("/tasks", TaskController, :index)
    post("/tasks", TaskController, :create)
    get("/tasks/:id", TaskController, :show)
    patch("/tasks/:id", TaskController, :update)
    post("/tasks/:id/assign", TaskController, :assign)
    post("/tasks/:id/complete", TaskController, :complete)
    delete("/tasks/:id", TaskController, :delete)

    get("/agents", AgentController, :index)
    post("/agents", AgentController, :create)
    get("/agents/:id", AgentController, :show)
    patch("/agents/:id", AgentController, :update)
    delete("/agents/:id", AgentController, :delete)

    get("/convoys", ConvoyController, :index)
    post("/convoys", ConvoyController, :create)
    get("/convoys/:id", ConvoyController, :show)
    post("/convoys/:id/tasks", ConvoyController, :add_tasks)
    delete("/convoys/:id", ConvoyController, :delete)

    get("/mailbox", MessageController, :index)
    get("/agents/:id/messages", MessageController, :agent_messages)
    get("/agents/:id/messages/unread", MessageController, :unread)
    post("/agents/:id/messages", MessageController, :create)
    patch("/messages/:id/read", MessageController, :mark_read)
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:backend, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through(:browser)

      live_dashboard("/dashboard", metrics: BackendWeb.Telemetry)
      forward("/mailbox", Plug.Swoosh.MailboxPreview)
    end
  end
end
