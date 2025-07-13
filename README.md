# Wayfinder

> **⚠️ Work in Progress** - This is an open source project under active development

An open source CLI tool that generates intelligent onboarding roadmaps for any Git repository, helping developers navigate complex codebases in seconds.

## Vision

Wayfinder aims to solve the "where do I start?" problem in large codebases by automatically generating data-driven onboarding documentation that stays fresh and relevant.

### Planned Features

- **Smart File Ranking**: Top-5 hotspot files ranked by churn, dependency depth, and ownership patterns
- **Visual Dependency Graphs**: Auto-generated dependency visualization (`docs/deps.svg`)
- **Ownership Intelligence**: Heatmaps showing code ownership and identifying brittle zones
- **Living Documentation**: Auto-updating `ONBOARD.md` that evolves with your codebase
- **CI/CD Integration**: GitHub Actions workflow for automated documentation refresh
- **Zero Configuration**: One command to analyze any repository

## Current Status

🚧 **In Development**

- [x] CLI foundation and project structure
- [x] GitHub Actions workflow generation
- [x] File churn analysis
- [ ] Dependency graph generation  
- [ ] Ownership analysis
- [ ] Markdown report generation
- [ ] Testing and validation

## Quick Start

*Note: Core analysis features are still being implemented*

```bash
# Clone and install
git clone https://github.com/jruttan1/wayfinder.git
cd wayfinder
pnpm install

# Run in development mode
pnpm dev .

# Generate GitHub Actions workflow
pnpm dev init
```

## Contributing

This is an open source project and we welcome contributions! 

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Install dependencies (`pnpm install`)
4. Make your changes
5. Run tests (`pnpm test`)
6. Submit a pull request

### Development
```bash
pnpm dev        # Run CLI in development mode
pnpm build      # Build for production
pnpm test       # Run test suite
pnpm lint       # Check code style
```

## Roadmap

- **v0.1**: Core analysis pipeline (churn, dependencies, ownership)
- **v0.2**: Rich markdown report generation with visualizations
- **v0.3**: LLM-powered code summaries and insights
- **v1.0**: Plugin architecture for additional languages and frameworks
- **v1.x**: VS Code extension and web dashboard

## Support

- 🐛 [Report Issues](https://github.com/your-username/wayfinder/issues)
- 💡 [Request Features](https://github.com/your-username/wayfinder/issues)
- 📖 [Documentation](https://github.com/your-username/wayfinder/wiki)
